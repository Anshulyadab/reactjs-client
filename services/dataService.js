/**
 * Data Service
 * 
 * Handles CRUD operations, data storage, and management
 */

const { Pool } = require('pg');
const { encryptSensitiveFields, decryptSensitiveFields } = require('./databaseService');

// Initialize database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * Insert data into storage
 */
const insertData = async (tableName, data, userId, metadata = {}) => {
  try {
    // Encrypt sensitive fields
    const { data: cleanData, encryptedFields } = encryptSensitiveFields(data);

    const result = await pool.query(`
      INSERT INTO data_storage (table_name, data, encrypted_fields, user_id, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `, [tableName, JSON.stringify(cleanData), JSON.stringify(encryptedFields), userId, JSON.stringify(metadata)]);

    // Log the insert operation
    await logDataOperation(userId, 'INSERT', tableName, result.rows[0].id, null, cleanData);

    return {
      success: true,
      message: 'Data inserted successfully',
      data: {
        id: result.rows[0].id,
        tableName,
        createdAt: result.rows[0].created_at
      }
    };
  } catch (error) {
    console.error('❌ Insert data error:', error);
    return {
      success: false,
      message: 'Failed to insert data',
      error: error.message
    };
  }
};

/**
 * Get data from storage
 */
const getData = async (tableName, userId = null, options = {}) => {
  try {
    const { limit = 100, offset = 0, orderBy = 'created_at', orderDirection = 'DESC' } = options;
    
    let query = `
      SELECT id, table_name, data, encrypted_fields, user_id, created_at, updated_at, metadata
      FROM data_storage 
      WHERE table_name = $1
    `;
    
    const params = [tableName];
    let paramCount = 1;

    if (userId) {
      paramCount++;
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
    }

    query += ` ORDER BY ${orderBy} ${orderDirection} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Decrypt sensitive fields for each record
    const decryptedData = result.rows.map(row => {
      const decrypted = decryptSensitiveFields(row.data, row.encrypted_fields || {});
      return {
        id: row.id,
        tableName: row.table_name,
        data: decrypted,
        userId: row.user_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        metadata: row.metadata
      };
    });

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM data_storage WHERE table_name = $1';
    const countParams = [tableName];
    
    if (userId) {
      countQuery += ' AND user_id = $2';
      countParams.push(userId);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    return {
      success: true,
      data: decryptedData,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    };
  } catch (error) {
    console.error('❌ Get data error:', error);
    return {
      success: false,
      message: 'Failed to get data',
      error: error.message
    };
  }
};

/**
 * Update data in storage
 */
const updateData = async (id, data, userId) => {
  try {
    // Get existing data
    const existingResult = await pool.query(
      'SELECT data, encrypted_fields FROM data_storage WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingResult.rows.length === 0) {
      return {
        success: false,
        message: 'Record not found or access denied'
      };
    }

    const existingData = existingResult.rows[0].data;
    const existingEncryptedFields = existingResult.rows[0].encrypted_fields || {};

    // Encrypt sensitive fields in new data
    const { data: cleanData, encryptedFields } = encryptSensitiveFields(data);

    // Merge with existing encrypted fields
    const mergedEncryptedFields = { ...existingEncryptedFields, ...encryptedFields };

    // Update the record
    const result = await pool.query(`
      UPDATE data_storage 
      SET data = $1, encrypted_fields = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING updated_at
    `, [JSON.stringify(cleanData), JSON.stringify(mergedEncryptedFields), id, userId]);

    if (result.rows.length === 0) {
      return {
        success: false,
        message: 'Failed to update record'
      };
    }

    // Log the update operation
    await logDataOperation(userId, 'UPDATE', 'data_storage', id, existingData, cleanData);

    return {
      success: true,
      message: 'Data updated successfully',
      data: {
        id,
        updatedAt: result.rows[0].updated_at
      }
    };
  } catch (error) {
    console.error('❌ Update data error:', error);
    return {
      success: false,
      message: 'Failed to update data',
      error: error.message
    };
  }
};

/**
 * Delete data from storage
 */
const deleteData = async (id, userId) => {
  try {
    // Get existing data for logging
    const existingResult = await pool.query(
      'SELECT data, table_name FROM data_storage WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingResult.rows.length === 0) {
      return {
        success: false,
        message: 'Record not found or access denied'
      };
    }

    const existingData = existingResult.rows[0].data;
    const tableName = existingResult.rows[0].table_name;

    // Delete the record
    const result = await pool.query(
      'DELETE FROM data_storage WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return {
        success: false,
        message: 'Failed to delete record'
      };
    }

    // Log the delete operation
    await logDataOperation(userId, 'DELETE', tableName, id, existingData, null);

    return {
      success: true,
      message: 'Data deleted successfully',
      data: { id }
    };
  } catch (error) {
    console.error('❌ Delete data error:', error);
    return {
      success: false,
      message: 'Failed to delete data',
      error: error.message
    };
  }
};

/**
 * Export data in various formats
 */
const exportData = async (tableName, format = 'json', userId = null, options = {}) => {
  try {
    const { limit = 1000, includeMetadata = false } = options;
    
    let query = `
      SELECT id, table_name, data, encrypted_fields, user_id, created_at, updated_at
      ${includeMetadata ? ', metadata' : ''}
      FROM data_storage 
      WHERE table_name = $1
    `;
    
    const params = [tableName];
    let paramCount = 1;

    if (userId) {
      paramCount++;
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);

    // Decrypt sensitive fields
    const decryptedData = result.rows.map(row => {
      const decrypted = decryptSensitiveFields(row.data, row.encrypted_fields || {});
      const exportRow = {
        id: row.id,
        tableName: row.table_name,
        data: decrypted,
        userId: row.user_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
      
      if (includeMetadata && row.metadata) {
        exportRow.metadata = row.metadata;
      }
      
      return exportRow;
    });

    let exportData;
    let contentType;
    let filename;

    switch (format.toLowerCase()) {
      case 'csv':
        exportData = convertToCSV(decryptedData);
        contentType = 'text/csv';
        filename = `${tableName}_export_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'xml':
        exportData = convertToXML(decryptedData);
        contentType = 'application/xml';
        filename = `${tableName}_export_${new Date().toISOString().split('T')[0]}.xml`;
        break;
      case 'json':
      default:
        exportData = JSON.stringify(decryptedData, null, 2);
        contentType = 'application/json';
        filename = `${tableName}_export_${new Date().toISOString().split('T')[0]}.json`;
        break;
    }

    return {
      success: true,
      data: exportData,
      contentType,
      filename,
      recordCount: decryptedData.length
    };
  } catch (error) {
    console.error('❌ Export data error:', error);
    return {
      success: false,
      message: 'Failed to export data',
      error: error.message
    };
  }
};

/**
 * Search data with filters
 */
const searchData = async (tableName, searchCriteria, userId = null, options = {}) => {
  try {
    const { limit = 100, offset = 0 } = options;
    
    let query = `
      SELECT id, table_name, data, encrypted_fields, user_id, created_at, updated_at, metadata
      FROM data_storage 
      WHERE table_name = $1
    `;
    
    const params = [tableName];
    let paramCount = 1;

    if (userId) {
      paramCount++;
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
    }

    // Add search criteria
    if (searchCriteria && Object.keys(searchCriteria).length > 0) {
      for (const [key, value] of Object.entries(searchCriteria)) {
        paramCount++;
        query += ` AND data->>'${key}' ILIKE $${paramCount}`;
        params.push(`%${value}%`);
      }
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Decrypt sensitive fields
    const decryptedData = result.rows.map(row => {
      const decrypted = decryptSensitiveFields(row.data, row.encrypted_fields || {});
      return {
        id: row.id,
        tableName: row.table_name,
        data: decrypted,
        userId: row.user_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        metadata: row.metadata
      };
    });

    return {
      success: true,
      data: decryptedData,
      searchCriteria,
      pagination: {
        limit,
        offset,
        count: decryptedData.length
      }
    };
  } catch (error) {
    console.error('❌ Search data error:', error);
    return {
      success: false,
      message: 'Failed to search data',
      error: error.message
    };
  }
};

/**
 * Get data statistics
 */
const getDataStatistics = async (tableName, userId = null) => {
  try {
    let query = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT user_id) as unique_users,
        MIN(created_at) as earliest_record,
        MAX(created_at) as latest_record,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_update_time
      FROM data_storage 
      WHERE table_name = $1
    `;
    
    const params = [tableName];
    
    if (userId) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await pool.query(query, params);
    const stats = result.rows[0];

    // Get data size
    const sizeQuery = `
      SELECT pg_size_pretty(pg_total_relation_size('data_storage')) as table_size
    `;
    const sizeResult = await pool.query(sizeQuery);

    return {
      success: true,
      statistics: {
        totalRecords: parseInt(stats.total_records),
        uniqueUsers: parseInt(stats.unique_users),
        earliestRecord: stats.earliest_record,
        latestRecord: stats.latest_record,
        avgUpdateTime: parseFloat(stats.avg_update_time) || 0,
        tableSize: sizeResult.rows[0].table_size
      }
    };
  } catch (error) {
    console.error('❌ Get statistics error:', error);
    return {
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    };
  }
};

/**
 * Log data operations for audit trail
 */
const logDataOperation = async (userId, action, tableName, recordId, oldValues, newValues) => {
  try {
    await pool.query(`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [userId, action, tableName, recordId, JSON.stringify(oldValues), JSON.stringify(newValues)]);
  } catch (error) {
    console.error('❌ Log operation error:', error);
  }
};

/**
 * Get audit logs
 */
const getAuditLogs = async (userId = null, options = {}) => {
  try {
    const { limit = 100, offset = 0, action = null, tableName = null } = options;
    
    let query = `
      SELECT al.*, u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (userId) {
      paramCount++;
      query += ` AND al.user_id = $${paramCount}`;
      params.push(userId);
    }

    if (action) {
      paramCount++;
      query += ` AND al.action = $${paramCount}`;
      params.push(action);
    }

    if (tableName) {
      paramCount++;
      query += ` AND al.table_name = $${paramCount}`;
      params.push(tableName);
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return {
      success: true,
      logs: result.rows,
      pagination: {
        limit,
        offset,
        count: result.rows.length
      }
    };
  } catch (error) {
    console.error('❌ Get audit logs error:', error);
    return {
      success: false,
      message: 'Failed to get audit logs',
      error: error.message
    };
  }
};

/**
 * Convert data to CSV format
 */
const convertToCSV = (data) => {
  if (data.length === 0) return '';

  const headers = ['id', 'tableName', 'userId', 'createdAt', 'updatedAt'];
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = [
      row.id,
      `"${row.tableName}"`,
      row.userId,
      row.createdAt,
      row.updatedAt
    ];
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

/**
 * Convert data to XML format
 */
const convertToXML = (data) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';
  
  for (const row of data) {
    xml += '  <record>\n';
    xml += `    <id>${row.id}</id>\n`;
    xml += `    <tableName>${row.tableName}</tableName>\n`;
    xml += `    <userId>${row.userId}</userId>\n`;
    xml += `    <createdAt>${row.createdAt}</createdAt>\n`;
    xml += `    <updatedAt>${row.updatedAt}</updatedAt>\n`;
    xml += '    <data>\n';
    
    for (const [key, value] of Object.entries(row.data)) {
      xml += `      <${key}>${value}</${key}>\n`;
    }
    
    xml += '    </data>\n';
    xml += '  </record>\n';
  }
  
  xml += '</data>';
  return xml;
};

module.exports = {
  insertData,
  getData,
  updateData,
  deleteData,
  exportData,
  searchData,
  getDataStatistics,
  getAuditLogs
};
