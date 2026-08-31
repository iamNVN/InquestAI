import { Sequelize, DataTypes } from 'sequelize';

// The user requested: use mysql for DB (3308 port, DB inquest (create if not exists), uname: root, password: admin)
// To automatically create the database if it doesn't exist, we first connect without specifying a database, create it, then connect normally.
// However, Sequelize doesn't officially support CREATE DATABASE out of the box in the connection string, 
// so we'll do it manually via mysql2 before initializing Sequelize models, or just assume it exists if we can't.
// Actually, we can use a raw connection to create it.
import mysql from 'mysql2/promise';

async function initializeDatabase() {
  const connection = await mysql.createConnection({ 
    host: process.env.DB_HOST || 'localhost', 
    port: parseInt(process.env.DB_PORT || '3308'), 
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || 'admin',
    ssl: { rejectUnauthorized: false }
  });
  const dbName = process.env.DB_NAME || 'inquest';
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  } catch (e) {
    console.log('Skipping db creation (hosted environments may restrict this).');
  }
  await connection.end();
}

const sequelize = new Sequelize(process.env.DB_NAME || 'inquest', process.env.DB_USER || 'root', process.env.DB_PASSWORD || 'admin', {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3308'),
  dialect: 'mysql',
  logging: false,
  dialectOptions: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

function generateShortId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 5; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

const Investigation = sequelize.define('Investigation', {
  id: { type: DataTypes.STRING(10), defaultValue: generateShortId, primaryKey: true },
  message_id: { type: DataTypes.STRING(500), unique: true, allowNull: true },
  raw_email: { type: DataTypes.TEXT('long') },
  status: { type: DataTypes.STRING, defaultValue: 'running' },
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

const EvidenceEntry = sequelize.define('EvidenceEntry', {
  id: { type: DataTypes.STRING, primaryKey: true },
  investigation_id: { type: DataTypes.STRING(10) },
  type: { type: DataTypes.STRING },
  agent: { type: DataTypes.STRING },
  summary: { type: DataTypes.TEXT },
  data: { type: DataTypes.JSON },
  confidence: { type: DataTypes.FLOAT },
  status: { type: DataTypes.STRING, defaultValue: 'UNVERIFIED' }, // UNVERIFIED, CORROBORATED, CONTESTED, REJECTED
  corroborated_by: { type: DataTypes.JSON }, // Array of agent strings
  source_tool: { type: DataTypes.STRING },
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

const GraphEdge = sequelize.define('GraphEdge', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  investigation_id: { type: DataTypes.STRING(10) },
  from_node: { type: DataTypes.STRING },
  to_node: { type: DataTypes.STRING },
  edge_type: { type: DataTypes.STRING },
  weight: { type: DataTypes.FLOAT },
  evidence_id: { type: DataTypes.STRING },
}, { timestamps: false });

const Verdict = sequelize.define('Verdict', {
  investigation_id: { type: DataTypes.STRING(10), primaryKey: true },
  verdict: { type: DataTypes.STRING },
  risk_level: { type: DataTypes.STRING },
  confidence: { type: DataTypes.STRING },
  summary: { type: DataTypes.TEXT },
  key_evidence: { type: DataTypes.JSON },
  counter_evidence: { type: DataTypes.JSON },
  iocs: { type: DataTypes.JSON },
  campaign_hypothesis: { type: DataTypes.JSON },
  recommended_action: { type: DataTypes.TEXT },
  report_markdown: { type: DataTypes.TEXT('long') },
}, { timestamps: false });

const HearingDialogue = sequelize.define('HearingDialogue', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  investigation_id: { type: DataTypes.STRING(10) },
  agent: { type: DataTypes.STRING }, // 'prosecutor', 'defense', 'judge'
  statement: { type: DataTypes.TEXT('long') },
}, { timestamps: true, createdAt: 'timestamp', updatedAt: false });

// Relationships
Investigation.hasMany(EvidenceEntry, { foreignKey: 'investigation_id', onDelete: 'CASCADE' });
EvidenceEntry.belongsTo(Investigation, { foreignKey: 'investigation_id' });

Investigation.hasMany(GraphEdge, { foreignKey: 'investigation_id', onDelete: 'CASCADE' });
Investigation.hasOne(Verdict, { foreignKey: 'investigation_id', onDelete: 'CASCADE' });
Investigation.hasMany(HearingDialogue, { foreignKey: 'investigation_id', onDelete: 'CASCADE' });

async function syncDb() {
  await initializeDatabase();
  await sequelize.sync({ alter: true });
  console.log('Database synced');
}

export {
  sequelize,
  syncDb,
  Investigation,
  EvidenceEntry,
  GraphEdge,
  Verdict,
  HearingDialogue
};
