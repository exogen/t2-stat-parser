'use strict'

const Database = use('Database')

class GameController {

  // /games
  async index({ inertia }) {

    const pageTitle = `Latest Games`;

    const gamesQry = await Database.raw(`
      SELECT distinct game_id,map,gametype, datestamp
      FROM games
      WHERE (stats->>'score' IS NOT NULL) AND (game_id <> 0)
      ORDER BY game_id desc
      LIMIT 2000;
      `);


      // filter out duplicate game_ids (https://dev.to/marinamosti/removing-duplicates-in-an-array-of-objects-in-js-with-sets-3fep)
      const games = gamesQry.rows.reduce((game, current) => {

      const x = game.find(item => item.game_id === current.game_id);
      if (!x) {
        return game.concat([current]);
      } else {
        return game;
      }
    }, []);

    // move the 0 score display logic here

    return inertia.render('Games/Main', { pageTitle, games }, { edgeVar: 'server-variable' })
  }


  // game/:game_id
  async game({ inertia, request }) {
    const gameInfo = await Database.from('games')
                                     .distinct('game_id',
                                     'map',
                                     'player_name',
                                     'player_guid',
                                     'gametype',
                                     'stats',
                                     'datestamp')
                                     .where({ game_id: request.params.game_id })
    const pageTitle = {
      name: gameInfo[0]['map'],
      gametype: gameInfo[0]['gametype']
    }

    return inertia.render('Games/Game', { pageTitle, gameInfo }, { edgeVar: 'server-variable' })
  }



}

module.exports = GameController
