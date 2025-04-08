#!/usr/bin/env node
// the above apparently makes clinc executable via CMD?

// clinc.js - 'Command Line Interface: Node.js & ClackJS'

// run with `npm run clinc`
// install globally on local using `npm install -g .`, but this is optional & only intended to allow cmd prompt to run clinc

// ⚠️ change global into specific imports for final refactor
import { MongoClient } from "./$node_modules/mongodb/mongodb.js";
import * as ckp from "./$node_modules/@clack/prompts/dist/index.js";
import pc from "./$node_modules/picocolors/picocolors.js";
import yargs from "./$node_modules/yargs/index.mjs";
import dotenv from "./$node_modules/dotenv/lib/main.js";
import seedData from "./seedData.js";
// setup
dotenv.config(); // environmental variables
const mongoURI = process.env.MONGO_URI;
const mongoDB = process.env.DATABASE_NAME;
const argv = yargs.argv; // props/methods check
const spinner = ckp.spinner();

// ⚠️ menus - structure as: { messaage: ``, options: [{}],};
const startMenu = {
  message: `Select a [command] using [\u2191\u2193] arrow keys:`,
  options: [
    { value: "list", label: pc.green(`List all collections in ${mongoDB}.`) },
    { value: "create", label: pc.green(`Create new collection.`) },
    { value: "retrieve", label: pc.green(`Retrieve data from existing collection.`) },
    { value: "update", label: pc.yellow(`Update or modify item description or price values.`) },
    { value: "delete-document", label: pc.red(`Delete item in collection.`) },
    { value: "delete-collection", label: pc.red(`Delete collection.`) },
    { value: "exit", label: "Exit" },
  ],
};

//

// validation subfunction
// * commented out to reduce code interdependency, though kept inline in case required in future
// const validateEmpty = (value) => value.trim() ? undefined: "Input can't be empty.";

// ⚠️ command functions
// simple bit to just list whatever collections are in the chosen database
async function listCollections(database) {
  try {
    const collections = await database.listCollections().toArray();
    console.log(pc.cyan(`Collections in database: ${mongoDB}`));
    if (collections.length === 0) {
      console.log(pc.yellow(`No collections found in database.`));
      return null;
    } else {
      collections.forEach((collection) => console.log(`- ${collection.name}`));
      return collections;
    }
  } catch (error) {
    console.error(pc.red(`Error fetching collections: ${error.message}`));
    return;
  }
}

// prompt for a collection name, offer to seed data into the new collection using the imported seedData.js, confirm once for either step, and create a new collection
// ! data seeding is currently locked to using contents of file named seedData.js - ensure data therein is correct & no other files are named seedData.js in this folder, and make changes directly to that file if required
async function createCollection(database) {
  try {
    // prompt for new collection name
    const collectionName = await ckp.text({
      message: "Enter a name for the new collection:",
      validate(value) {
        if (!value.trim()) return "Collection name can't be empty.";
        return undefined;
      },
    });

    if (!collectionName) {
      console.log("Action cancelled.");
      return;
    }

    // check for extant collection with same name
    const existingCollections = await database.listCollections({ name: collectionName }).toArray();
    if (existingCollections.length > 0) {
      console.log(pc.yellow(`A collection named: ${collectionName} already exists.`));
      return;
    }

    const confirmation = await ckp.confirm({
      message: `Confirm new collection named: ${collectionName}`,
    });

    if (!confirmation) {
      console.log("Action cancelled.");
      return;
    }

    // create the new collection
    const collection = database.collection(collectionName);
    await database.createCollection(collectionName);
    console.log(pc.green(`Collection: ${collectionName} created in database: ${mongoDB}`));

    // prompt for optional seeding
    const seedConfirmation = await ckp.confirm({
      message: `Seed new collection: ${collectionName} with sample data from current seedData.js?`,
    });

    if (seedConfirmation) {
      spinner.start(`Seeding data into: ${collectionName}`);
      // in case seedData.js file is somehow empty
      if (seedData.length === 0) {
        console.log(pc.yellow(`No seed data available to insert into: ${collectionName}.`));
        return;
      }

      await collection.insertMany(seedData);
      spinner.stop(pc.green(`Data seeded into: ${collectionName}`));
    } else {
      console.log(pc.yellow(`No data seeded into new collection.`));
    }
  } catch (error) {
    console.error(pc.red(`Error creating collection: ${error.message}`));
  }
}

// shows a list of collections in the database. just a title search for now; other 'search by' operations beyond that feel like scope creep at this stage
async function retrieveCollection(database) {
  try {
    // prompt for collection lookup
    const collectionName = await ckp.text({
      message: "Enter name of collection to retrieve:",
      validate(value) {
        if (!value.trim()) return "Collection name can't be empty.";
        return undefined;
      },
    });

    if (!collectionName) {
      console.log("Action cancelled.");
      return;
    }

    // check if the validated collection name actually exists
    const collections = await database.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.log(pc.yellow(`Collection: ${collectionName} does not exist.`));
      return;
    }

    // fetch collection data
    const collection = database.collection(collectionName);

    // projection forces only specified field (title) to return
    const documents = await collection.find({}, { projection: { title: 1, _id: 0 } }).toArray();
    if (documents.length === 0) {
      console.log(pc.yellow(`Collection: ${collectionName} is currently empty.`));
      return;
    }

    console.log(pc.cyan(`Items in collection: ${collectionName}:`));
    documents.forEach((doc) => console.log(`- ${doc.title}`));

    // prompt for more info per title
    const searchConfirmation = await ckp.confirm({
      message: "Look up a specific item's extended information?",
    });

    if (searchConfirmation) {
      const title = await ckp.text({
        message: "Item title to look up:",
        validate(value) {
          if (!value.trim()) return "Item query can't be empty.";
          return undefined;
        },
      });

      const item = await collection.findOne({ title });
      if (item) {
        console.log(`
          ${pc.cyan(`Found item: ${title}`)}
          Description: ${item.description}
          Start Price: $${item.start_price}
          Reserve Price: $${item.reserve_price}
       `);
      } else {
        console.log(pc.yellow(`No item found named: ${title}.`));
      }
    }
  } catch (error) {
    console.error(pc.red(`Error retrieving collection: ${error.message}`));
  }
}

// some overlap with retrieveCollection(), but after prompting for the collection name that the user wants to edit, prompts for an item and prompts whether the user wants to change start price or reserve price - i'ma stop there because me potato.
// ? validation, retrieval and title look-up functions could've been encapsulated as shared child functions, but preference is to keep these commands as independent as possible with fewer interlocked parts
async function updateCollection(database) {
  try {
    // prompt for collection to update
    const collectionName = await ckp.text({
      message: "Enter name of collection to update:",
      validate(value) {
        if (!value.trim()) return "Collection name can't be empty.";
        return undefined;
      },
    });

    if (!collectionName) {
      console.log("Action cancelled.");
      return;
    }

    // nother check for missing collection
    const collections = await database.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.log(pc.yellow(`Collection: ${collectionName} does not exist.`));
      return;
    }

    // fetch collection
    const collection = database.collection(collectionName);

    // prompt for item title to update
    const title = await ckp.text({
      message: "Enter item name/title to update:",
      validate(value) {
        if (!value.trim()) return "Name/title can't be empty.";
        return undefined;
      },
    });

    if (!title) {
      console.log("Action cancelled.");
      return;
    }

    // check if the item exists
    const item = await collection.findOne({ title });
    if (!item) {
      console.log(pc.yellow(`No item found named: ${title}`));
      return;
    }

    console.log(`
      ${pc.cyan(`Found item: ${title}`)}
      Description: ${item.description}
      Start price: $${item.start_price}
      Reserve price: $${item.reserve_price}
      `);

    // pick which price field to update
    const updateChoice = await ckp.select({
      message: "Choose field to update:",
      options: [
        { value: "description", label: "Description" },
        { value: "start_price", label: "Start price" },
        { value: "reserve_price", label: "Reserve price" },
      ],
    });

    // 🚨 come at me const police
    let newValue;

    // prompt for new price value
    if (updateChoice === "start_price" || updateChoice === "reserve_price") {
      newValue = await ckp.text({
        message: `Enter new ${updateChoice.replace("_", " ")} for: ${title}`,
        validate(value) {
          if (isNaN(value) || Number(value) <= 0) return "Value must be positive number.";
          return undefined;
        },
      });

      if (!newValue) {
        console.log("Action cancelled.");
        return;
      }

      // enforce data type so mongo doesn't yell at me
      newValue = Number(newValue);
    } else {
      newValue = await ckp.text({
        message: `Enter new description for: ${title}`,
        validate(value) {
          if (!value.trim()) return "Description can't be empty.";
          if (value.length > 140)
            return `Description must be 140 characters or less. New description is ${value.length} characters long.`;
          return undefined;
        },
      });

      if (!newValue) {
        console.log("Action cancelled.");
        return;
      }
    }

    // finally update chosen price field
    const updateResult = await collection.updateOne({ title }, { $set: { [updateChoice]: newValue } });

    if (updateResult.modifiedCount > 0) {
      console.log(pc.green(`Successfully updated ${updateChoice} for item: ${title}.`));
    } else {
      console.log(pc.yellow(`No changes made to item: ${title}. New value may have been same as current.`));
    }
  } catch (error) {
    console.error(pc.red(`Error updating collection: ${error.message}.`));
  }
}

// deletes all items aka documents that match a given query. mostly a copy of deleteCollection() because this was written later
async function deleteDocument(database) {
  try {
    // prompt for target collection
    const collectionName = await ckp.text({
      message: "Enter the name of the collection to modify:",
      validate(value) {
        if (!value.trim()) return "Collection name can't be empty.";
        return undefined;
      },
    });

    if (!collectionName) {
      console.log("Action cancelled.");
      return;
    }

    // check if the collection exists
    const collections = await database.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.log(pc.yellow(`Collection: ${collectionName} does not exist.`));
      return;
    }

    // prompt for the document name to delete
    const itemName = await ckp.text({
      message: "Enter item name/title to delete:",
      validate(value) {
        if (!value.trim()) return "Name/title can't be empty.";
        return undefined;
      },
    });

    if (!itemName) {
      console.log("Action cancelled.");
      return;
    }

    // confirmation steps
    const confirmDeletion = await ckp.confirm({
      message: `${pc.bgRed(
        pc.black(
          ` OHITI: ALL ITEMS with name: ${itemName} will be permanently deleted in: ${collectionName}. Are you sure? `
        )
      )}`,
    });

    if (!confirmDeletion) {
      console.log("Action cancelled.");
      return;
    }

    const finalConfirm = await ckp.confirm({
      message: `Final confirmation: delete all items named: ${itemName} from: ${collectionName}?`,
    });

    if (!finalConfirm) {
      console.log("Action cancelled.");
      return;
    }

    // perform the document deletion
    const collection = database.collection(collectionName);
    const deleteResult = await collection.deleteMany({ title: itemName });

    if (deleteResult.deletedCount > 0) {
      console.log(
        pc.green(
          `Deleted ${deleteResult.deletedCount} items with the name/title: ${itemName} from collection: ${collectionName}.`
        )
      );
    } else {
      console.log(pc.yellow(`No items in collection: ${collectionName} match the name/title: ${itemName}.`));
    }
  } catch (error) {
    console.error(pc.red(`Error deleting item: ${error.message}`));
  }
}

// 1.) prompts for a collection name, 2.) advises all data within that collection will be permanently lost and ask for confirmation, then 3.) throws up one last y/n confirmation.
async function deleteCollection(database) {
  try {
    // prompt for target collection
    const collectionName = await ckp.text({
      message: "Enter name of collection to delete:",
      validate(value) {
        if (!value.trim()) return "Collection name can't be empty.";
        return undefined;
      },
    });

    if (!collectionName) {
      console.log("Action cancelled.");
      return;
    }

    // checks if target exists
    const collections = await database.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.log(pc.yellow(`Collection: ${collectionName} does not exist.`));
      return;
    }

    // confirmation steps
    const confirmDeletion = await ckp.confirm({
      message: `${pc.bgRed(
        pc.black(` OHITI: All data in: ${collectionName} will be permanently deleted. Are you sure? `)
      )}`,
    });

    if (!confirmDeletion) {
      console.log("Action cancelled.");
      return;
    }

    const finalConfirm = await ckp.confirm({
      message: `Final confirmation: delete ${collectionName}?`,
    });

    if (!finalConfirm) {
      console.log("Action cancelled.");
      return;
    }

    // deletes target collection
    const collection = database.collection(collectionName);
    await collection.drop();
    console.log(pc.green(`Collection: ${collectionName} successfully deleted.`));
  } catch (error) {
    console.error(pc.red(`Error deleting collection: ${error.message}`));
  }
}

// connect to mongoDB and return list of current databases & clients
async function connectToMongoDB() {
  // create new mongo instance with timeout in case i botch something
  const client = new MongoClient(mongoURI, { serverSelectionTimeoutMS: 5000 });
  spinner.start(`Connecting to MongoDB.`);
  try {
    await client.connect();
    spinner.stop(pc.green(`Connection OK to MongoDB instance at ${mongoURI}`));
    const database = client.db(mongoDB);

    return { database, client };
  } catch (error) {
    spinner.fail(
      pc.red(`Connection error to MongoDB instance: ${error.message}
      `)
    );
    process.exit(1);
  }
}

// rubber, meet road
async function main() {
  // establish link to MongoDB instance
  const { database, client } = await connectToMongoDB();

  console.log(pc.green(`\nConnected to database: ${mongoDB}\n\nHaere mai.\n`));

  try {
    // console.log(`Process arguments:${process.argv}`);
    // console.log(`Current database: ${database}`);

    // enables looping until "exit" command changes this flag or user force-terminates
    let exitFlag = false;

    while (!exitFlag) {
      // prompt menu action on start:
      const startPrompt = await ckp.select(startMenu);

      switch (startPrompt) {
        case "list":
          await listCollections(database);
          break;
        case "create":
          await createCollection(database);
          break;
        case "retrieve":
          await retrieveCollection(database);
          break;
        case "update":
          await updateCollection(database);
          break;
        case "delete-document":
          await deleteDocument(database);
          break;
        case "delete-collection":
          await deleteCollection(database);
          break;
        case "exit":
          exitFlag = true;
          return;
      }
    }
  } finally {
    await client.close();
    console.log(
      `\n${pc.green("> Operation end: MongoDB connection closed")}\n
      ${pc.bgMagenta(pc.black(" Exiting clinc. E noho rā. "))}\n`
    );
  }
  //ckp.outro(`${pc.bgMagenta(pc.black(" Exiting clinc. E noho rā. "))}`);
}

// call main function to start
main().catch((error) => {
  console.error(`${pc.red(`Error`)}: ${error.message}`);
  process.exit(1);
});
