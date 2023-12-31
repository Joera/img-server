#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { node } from './node.js';
import { DockerService, IDockerService } from './docker.js';

const docker: IDockerService = new DockerService();

yargs(hideBin(process.argv))
  .command(
    'db:create [db]',
    'creates a new database',
     (yargs) => {
      return yargs
      .positional('db', {
        describe: 'the name of the database, for example img1'
      })
    },
    async (argv) => { 

        const res = await node('create',{ db: argv.db });
        process.stdout.write(JSON.stringify(res) + '\n');
    }
  )
  .command(
    'db:drop [db]',
    'deletes a database',
     (yargs) => {
      return yargs
      .positional('db', {
        describe: 'the name of the database, for example img1'
      })
    },
    async (argv) => { 

        const res = await node('drop',{ db: argv.db });
        process.stdout.write(JSON.stringify(res) + '\n');
    }
  )
  .command(
    'db:update [db]',
    'updates a database to latest backup',
     (yargs) => {
      return yargs
      .positional('db', {
        describe: 'the name of the database, for example img1'
      })
    },
    async (argv) => { 

        const res = await node('update',{ db: argv.db });
        process.stdout.write(JSON.stringify(res) + '\n');
    }
  )
  .command(
    'db:config',
    'show databases',
     (yargs) => {
      return yargs
    },
    async (argv) => { 

        const res: any = await node('config', {});

        for (const [key, value] of Object.entries(res)) {
            process.stdout.write(`${key}: ${value} \n`);
        }
    }
  )
  .command(
    'db:prepare [db]',
    'prepare database for data entry',
     (yargs) => {
        return yargs
        .positional('db', {
            describe: 'the name of the database, for example img1'
        })
    },
    async (argv) => { 

        const dbConfig = await node('db',{ name: 'new_db', db: argv.db });
        const res: any = await node('update',{ db: argv.db });
        process.stdout.write(JSON.stringify(res) + '\n');
    }
  )
  .command(
      'db:publish [db]',
      'connect live dashboard to this database',
      (yargs) => {
          return yargs
          .positional( 'db', {
            describe: 'the name of the database, for example img1'
          })
      },
      async (argv) => {

        const dbConfig = await node('db',{ name: 'live_db', db: argv.db });
        // hoe had dit dan moeten werken als .wnv bestand niet wordt bijgewerkt? 
        let res = await docker.compose(dbConfig)

        process.stdout.write(res);
      }
    )
    .command(
    'db:stage [db]',
    'connect staging dashboard to this database',
    (yargs) => {
        return yargs
        .positional( 'db', {
            describe: 'the name of the database, for example img1'
        })
    },
    async (argv) => {

        const dbConfig = await node('db',{ name: 'staging_db', db: argv.db });
        let res = await docker.compose(dbConfig)

        process.stdout.write(res);
      }
    )
    .command(
      'db:backup [db] [name]',
      'backup database to the spaces bucket in digital ocean',
      (yargs) => {
          return yargs
          .positional( 'db', {
              describe: 'the name of the database, for example img1'
          })
          .positional( 'name', {
            describe: 'type of backup: live db, work in progress, etc ... '
        })
      },
      async (argv) => {
  
          const res = await node('backup',{ db: argv.db, name: argv.name });
          process.stdout.write(JSON.stringify(res) + '\n');
        }
      )
    .command(
      'data:entry [week]',
      'import data from csv',
      (yargs) => {
          return yargs
          .positional('week', {
            describe: 'week number'
          })
          .option('topic', {
              describe: 'the name of the data category, one of: fs,ves,kto,mss,wdims',
              default: 'all'
          })
          .option('db', {
            describe: 'name of the db',
            default: 'img_new'
          })
      },
      async (argv) => {

        const db = (argv.db == null) ? "img_" + argv.week : argv.db
        const res: any = await node('data_entry',{ week:argv.week, topic: argv.topic, db });
        process.stdout.write(JSON.stringify(res));

      })
      .command(
        'api:view [name] [db]',
        'add the public read permissions for a new api endpoint',
        (yargs) => {
            return yargs
            .positional( 'name', {
                describe: 'the name of the api view'
            })
            .positional( 'db', {
              describe: 'the db for which to add the view'
          })
        },
        async (argv) => {
            const res: any = await node('api_view',{ name: argv.name, db: argv.db });
            process.stdout.write(JSON.stringify(res));
        })
  // Enable strict mode.
  .strict()
  // Useful aliases.
  .alias({ h: 'help' })
  .argv;