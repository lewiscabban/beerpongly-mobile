import * as SQLite from 'expo-sqlite';


export interface Tournament {
    id: number;
    name: string;
    progress: string;
}

export interface Team {
    id: number;
    name: string;
    position: number;
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

export const getTournament = async (db: SQLite.SQLiteDatabase, tournamentId: number): Promise<Tournament | null> => {
    const tournament: Tournament | null = await db.getFirstAsync('SELECT * FROM tournament WHERE id = ?', tournamentId);
    return tournament
};

export const createTeamTable = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    // const alter = await db.runAsync("ALTER TABLE team ADD COLUMN position INTEGER")
    const table = await db.runAsync("CREATE TABLE IF NOT EXISTS team (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, position INTEGER, tournamentId INTEGER, FOREIGN KEY(tournamentId) REFERENCES tournament(id))");
    console.log("table: " + table)
};

export const insertTeam = async (db: SQLite.SQLiteDatabase, name: string, position: number, tournamentId: number): Promise<void> => {
    console.log("name: " + name + " position: " + position + " id: " + tournamentId)
    const result = await db.runAsync('INSERT INTO team (name, position, tournamentId) VALUES (?, ?, ?)', name, position, tournamentId);
    console.log("insert: " + result)
};

export const updateTeams = async (db: SQLite.SQLiteDatabase, teams: Team[]): Promise<void> => {
    for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        const result = await db.runAsync('UPDATE team SET position = ? WHERE id = ?', team.position, team.id);
        console.log("results: " + result)
    }
};

export const getTeams = async (db: SQLite.SQLiteDatabase, tournamentId: number): Promise<Team[]> => {
    const allRows: Team[] = await db.getAllAsync('SELECT * FROM team WHERE tournamentId = ?', tournamentId);
    return allRows
};
