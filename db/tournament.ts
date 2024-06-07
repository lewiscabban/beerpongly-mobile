import * as SQLite from 'expo-sqlite';


export interface Tournament {
    id: number;
    name: string;
    progress: string;
}

export interface Team {
    id: number;
    name: string;
    tournamentId: number;
}

export const initTournamentDB = async (): Promise<SQLite.SQLiteDatabase> => {
    return await SQLite.openDatabaseAsync('tournament');
};

export const createTournamentTable = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    const table = await db.runAsync("CREATE TABLE IF NOT EXISTS tournament (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, progress TEXT NOT NULL)");
    console.log("table: " + table)
};

export const insertTournament = async (db: SQLite.SQLiteDatabase, name: string, progress: string): Promise<number> => {
    const result = await db.runAsync('INSERT INTO tournament (name, progress) VALUES (?, ?)', name, progress);
    console.log("insert: " + result)
    return result.lastInsertRowId
};

export const getTournaments = async (db: SQLite.SQLiteDatabase): Promise<Tournament[]> => {
    const allRows: Tournament[] = await db.getAllAsync('SELECT * FROM tournament');
    return allRows
};

export const createTeamTable = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    const table = await db.runAsync("CREATE TABLE IF NOT EXISTS team (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, tournamentId INTEGER, FOREIGN KEY(tournamentId) REFERENCES tournament(id))");
    console.log("table: " + table)
};

export const insertTeam = async (db: SQLite.SQLiteDatabase, name: string, tournamentId: number): Promise<void> => {
    const result = await db.runAsync('INSERT INTO team (name, tournamentId) VALUES (?, ?)', name, tournamentId);
    console.log("insert: " + result)
};

export const getTeams = async (db: SQLite.SQLiteDatabase, tournamentId: number): Promise<Team[]> => {
    const allRows: Team[] = await db.getAllAsync('SELECT * FROM team WHERE tournamentId = ?', tournamentId);
    return allRows
};
