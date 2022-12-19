const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getQuery = `
  select *
  from cricket_team`;

  const playersArray = await db.all(getQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//post
app.post("/players/", async (request, response) => {
  const { player_name, jersey_number, role } = request.body;

  const addQuery = `
    insert into
     cricket_team (player_name,jersey_number,role)
     values
   (
    '${player_name}',
    '${jersey_number}',
    '${role}',
     );`;
  const player = await db.run(addQuery);
  response.send("Player Added to Team");
});

//get
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getQuery = `
select *
from cricket_team
where player_id=${playerId};`;
  const player = await db.get(getQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  response.send(convertDbObjectToResponseObject(player));
});

//put
app.put("/players/:playerId/", async (request, response) => {
  const [playerId] = request.params;
  const playerdetails = request.body;
  const { player_name, jersey_number, role } = playerdetails;

  const addQuery = `
update
cricket_team (player_name,jersey_number,role)
set
(
${player_name},
${jersey_number},
${role},
)
where player_id=${playerId};`;
  await db.run(addQuery);
  response.send("Player Details Updated");
});

//delete
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const Query = `
delete
from cricket_team
where player_id=${playerId};`;
  await db.run(Query);
  response.send("Player Removed");
});

module.exports = app;
