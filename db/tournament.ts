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

export interface Match {
    id: number;
    round: number;
    firstTeam: number;
    secondTeam: number;
    firstTeamCups: number;
    secondTeamCups: number;
    winner: number;
    firstPreviousMatchId: number;
    secondPreviousMatchId: number;
    nextMatch: number;
    tournamentId: number;
}

export interface Round {
    id: number;
    matches: Match[]
}

export interface Matchup {
  id: number
  firstTeam: Team
  secondTeam: Team
}

export const getTotalRounds = (teams: Team[]): number => {
    let currentTeams = teams.length;
    let totalRounds = 0;
    // Calculating the total number of rounds
    while (currentTeams > 1) {
        currentTeams /= 2;
        totalRounds++;
    }
    return totalRounds;
}

export const initTournamentDB = async (): Promise<SQLite.SQLiteDatabase> => {
    return await SQLite.openDatabaseAsync('tournament');
};

export const createTournamentTable = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    const table = await db.runAsync(`
        CREATE TABLE IF NOT EXISTS tournament (
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            progress TEXT NOT NULL
        )
    `);
    console.log("table: " + table)
};

export const updateTournament = async (db: SQLite.SQLiteDatabase, tournament: Tournament): Promise<number> => {
    const result = await db.runAsync('UPDATE tournament SET progress = ?, name = ? WHERE id = ?', tournament.progress, tournament.name, tournament.id);
    console.log("insert: " + result)
    return result.lastInsertRowId
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

export const deleteTournament = async (db: SQLite.SQLiteDatabase, tournament: Tournament): Promise<void> => {
    const result = await db.runAsync(`
        DELETE FROM tournament
        WHERE id = ?`,
        tournament.id);
    console.log("results: " + result)
};

export const createTeamTable = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    // const alter = await db.runAsync("ALTER TABLE team ADD COLUMN position INTEGER")
    const table = await db.runAsync(`
        CREATE TABLE IF NOT EXISTS team (
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            position INTEGER,
            tournamentId INTEGER,
            FOREIGN KEY(tournamentId) REFERENCES tournament(id)
        )
    `);
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

export const deleteTeams = async (db: SQLite.SQLiteDatabase, teams: Team[]): Promise<void> => {
    for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        const result = await db.runAsync(`
            DELETE FROM team
            WHERE tournamentId = ?`,
            team.tournamentId);
        console.log("results: " + result)
    }
};

export const getTeams = async (db: SQLite.SQLiteDatabase, tournamentId: number): Promise<Team[]> => {
    const allRows: Team[] = await db.getAllAsync('SELECT * FROM team WHERE tournamentId = ?', tournamentId);
    return allRows
};

export const getTeam = async (db: SQLite.SQLiteDatabase, id: number): Promise<Team | null> => {
    const team: Team | null = await db.getFirstAsync('SELECT * FROM team WHERE id = ?', id);
    return team
};

export const createMatchTable = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    // const alter = await db.runAsync("ALTER TABLE team ADD COLUMN position INTEGER")
    const table = await db.runAsync(`
        CREATE TABLE IF NOT EXISTS match (
            id INTEGER PRIMARY KEY NOT NULL,
            round INTEGER,
            firstTeam INTEGER,
            secondTeam INTEGER,
            firstTeamCups INTEGER,
            secondTeamCups INTEGER,
            winner INTEGER,
            firstPreviousMatchId INTEGER,
            secondPreviousMatchId INTEGER,
            nextMatch INTEGER,
            tournamentId INTEGER,
            FOREIGN KEY(firstTeam) REFERENCES team(id)
            FOREIGN KEY(secondTeam) REFERENCES team(id)
            FOREIGN KEY(winner) REFERENCES team(id)
            FOREIGN KEY(firstPreviousMatchId) REFERENCES match(id)
            FOREIGN KEY(secondPreviousMatchId) REFERENCES match(id)
            FOREIGN KEY(nextMatch) REFERENCES match(id)
            FOREIGN KEY(tournamentId) REFERENCES tournament(id)
        )
    `);
    console.log("table: " + table)
};

export const insertMatch = async (db: SQLite.SQLiteDatabase, round: number, firstTeam: number | null, secondTeam: number | null, firstTeamCups: number, secondTeamCups: number, winner: number | null, firstPreviousMatchId: number | null, secondPreviousMatchId: number | null, nextMatch: number | null, tournamentId: number): Promise<Match | null> => {
    // console.log("name: " + name + " position: " + position + " id: " + tournamentId)
    const result = await db.runAsync('INSERT INTO match (round, firstTeam, secondTeam, firstTeamCups, secondTeamCups, winner, firstPreviousMatchId, secondPreviousMatchId, nextMatch, tournamentId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', round, firstTeam, secondTeam, firstTeamCups, secondTeamCups, winner, firstPreviousMatchId, secondPreviousMatchId, nextMatch, tournamentId);
    console.log("insert: " + result.changes)
    return getMatch(db, result.lastInsertRowId)
};

export const updateMatches = async (db: SQLite.SQLiteDatabase, matches: Match[]): Promise<void> => {
    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const result = await db.runAsync(`
            UPDATE match SET
            round = ?,
            firstTeam = ?,
            secondTeam = ?,
            firstTeamCups = ?,
            secondTeamCups = ?,
            winner = ?,
            firstPreviousMatchId = ?,
            secondPreviousMatchId = ?,
            nextMatch = ?
            WHERE id = ?`,
            match.round,
            match.firstTeam,
            match.secondTeam,
            match.firstTeamCups,
            match.secondTeamCups,
            match.winner,
            match.firstPreviousMatchId,
            match.secondPreviousMatchId,
            match.nextMatch,
            match.id);
        console.log("results: " + result)
    }
};

export const updateMatch = async (db: SQLite.SQLiteDatabase, match: Match): Promise<void> => {
    const result = await db.runAsync(`
        UPDATE match SET
        round = ?,
        firstTeam = ?,
        secondTeam = ?,
        firstTeamCups = ?,
        secondTeamCups = ?,
        winner = ?,
        firstPreviousMatchId = ?,
        secondPreviousMatchId = ?,
        nextMatch = ?
        WHERE id = ?`,
        match.round,
        match.firstTeam,
        match.secondTeam,
        match.firstTeamCups,
        match.secondTeamCups,
        match.winner,
        match.firstPreviousMatchId,
        match.secondPreviousMatchId,
        match.nextMatch,
        match.id);
        console.log("results: " + result)
};

export const deleteMatches = async (db: SQLite.SQLiteDatabase, matches: Match[]): Promise<void> => {
    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const result = await db.runAsync(`
            DELETE FROM match
            WHERE tournamentId = ?`,
            match.tournamentId);
        console.log("results: " + result)
    }
};

export const deleteMatch = async (db: SQLite.SQLiteDatabase, match: Match): Promise<void> => {
    const result = await db.runAsync(`
        DELETE FROM match
        WHERE id = ?`,
        match.id);
    console.log("results: " + result)
};

export const getMatches = async (db: SQLite.SQLiteDatabase, tournamentId: number): Promise<Match[]> => {
    const allRows: Match[] = await db.getAllAsync('SELECT * FROM match WHERE tournamentId = ?', tournamentId);
    return allRows
};

export const getMatch = async (db: SQLite.SQLiteDatabase, id: number): Promise<Match | null> => {
    const match: Match | null = await db.getFirstAsync('SELECT * FROM match WHERE id = ?', id);
    return match
};
