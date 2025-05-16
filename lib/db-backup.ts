import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"
import { logError } from "./error-utils"

const execAsync = promisify(exec)
const writeFileAsync = promisify(fs.writeFile)
const readFileAsync = promisify(fs.readFile)
const mkdirAsync = promisify(fs.mkdir)

// Function to create a database backup
export async function createDatabaseBackup(): Promise<string | null> {
  try {
    // Get database URL from environment variables
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    // Parse the database URL to get connection details
    const url = new URL(databaseUrl)
    const host = url.hostname
    const port = url.port || "5432"
    const database = url.pathname.substring(1)
    const username = url.username
    const password = url.password

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), "backups")
    await mkdirAsync(backupDir, { recursive: true })

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const backupFilename = `backup-${timestamp}.sql`
    const backupPath = path.join(backupDir, backupFilename)

    // Set environment variables for pg_dump
    const env = {
      ...process.env,
      PGPASSWORD: password,
    }

    // Execute pg_dump command
    const { stdout, stderr } = await execAsync(
      `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f ${backupPath}`,
      { env },
    )

    if (stderr) {
      console.error("pg_dump stderr:", stderr)
    }

    console.log(`Database backup created at ${backupPath}`)

    return backupPath
  } catch (error) {
    logError(error, "CREATE_DATABASE_BACKUP")
    return null
  }
}

// Function to restore a database from backup
export async function restoreDatabaseFromBackup(backupPath: string): Promise<boolean> {
  try {
    // Get database URL from environment variables
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    // Parse the database URL to get connection details
    const url = new URL(databaseUrl)
    const host = url.hostname
    const port = url.port || "5432"
    const database = url.pathname.substring(1)
    const username = url.username
    const password = url.password

    // Set environment variables for psql
    const env = {
      ...process.env,
      PGPASSWORD: password,
    }

    // Execute psql command to restore the database
    const { stdout, stderr } = await execAsync(
      `psql -h ${host} -p ${port} -U ${username} -d ${database} -f ${backupPath}`,
      { env },
    )

    if (stderr) {
      console.error("psql stderr:", stderr)
    }

    console.log(`Database restored from ${backupPath}`)

    return true
  } catch (error) {
    logError(error, "RESTORE_DATABASE_FROM_BACKUP")
    return false
  }
}

// Function to list available backups
export async function listDatabaseBackups(): Promise<string[]> {
  try {
    const backupDir = path.join(process.cwd(), "backups")

    // Create backup directory if it doesn't exist
    await mkdirAsync(backupDir, { recursive: true })

    // Read the backup directory
    const files = await fs.promises.readdir(backupDir)

    // Filter for SQL backup files
    return files.filter((file) => file.startsWith("backup-") && file.endsWith(".sql"))
  } catch (error) {
    logError(error, "LIST_DATABASE_BACKUPS")
    return []
  }
}

