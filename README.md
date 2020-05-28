# BscotchMonday: The Monday.com API API

***WARNING:*** This project is in active development
and will likely have breaking changes in each new version.

Monday.com has a robust GraphQL API for automating
tasks and building tools, but using it requires a
lot of documentation-reading and additional infrastructure
to keep track of all the data.

This project aims to provide an API for the API,
abstracting away the GraphQL bits and making it easier
to collect, manage, update, and track data.

BscotchMonday is designed around Node/JavaScript
tooling to make it so that your tools
(like VSCode, Typescript, ESLint, etc)
can help you as much as possible.

## Setup

Install from **npm**: `npm i 

**JavaScript (node.js):**

```js
const {fetchMondayBoard} = require('@bscotch/monday');
const yourMondayAPIToken = 'your private token';

/** Sample function for loading a board.
 * @param {string} boardId */
async function manageBoard(boardId){
  const board = await fetchMondayboard({
    boardId,
    token: yourMondayAPIToken
  });
  // do something with the board . . .
}

// Or chaining with `then`:
fetchMondayBoard({boardId}).then(board=>{/** do something */});
```

**Typescript (node.js)**

```ts
import {fetchMondayBoard} from "@bscotch/monday";
const yourMondayAPIToken = 'your private token';

/** Sample function for loading a board. */
async function manageBoard(boardId:string){
  const board = await fetchMondayboard({
    boardId,
    token: yourMondayAPIToken
  });
  // do something with the board . . .
}
```

Your API Token can also be specified via the environment
variable `MONDAY_API_TOKEN`, in which case you can leave it
out of the board options.

## Usage

### Model

BscotchMonday is board-focused, so everything is centered
on the MondayBoard class. MondayBoards collect board-specific
(e.g. groups) and global (e.g. users, tags) data. A MondayBoard
contains a list of MondayGroups, which are the level at which
you'll manage MondayItems.

```ts
// Get a board
const board    = await fetchMondayboard({boardId});

// Boards store global and board-specific data
// (all refreshed by `await board.refresh()`)
const groups   = board.groups;
const myGroup  = board.getGroupByName('My Group');
const tags     = board.tags;
const myTag    = board.getTagByName('my-tag');
const columns  = board.columns;
const myColumn = board.getColumnByName('My Column');
const users    = board.users;

// Items are managed at the Group level
const newItem = await myGroup.createItem('Item title');

// Column Values are managed at the Item level. Changes
// are only submitted upon `item.save()`
const itemCheckbox = newItem.getColumnValueByName("Checkbox Column");
itemCheckbox.setCheckbox(true);
const itemTags = newItem.getColumnValueByName("Tags");
itemTags.setTags(['a-tag','another-tag']); // Must already exist
await newItem.save(); // Submit changed values to Monday.com

await newItem.delete(); // Perhaps you need to clean up after yourself.

```

### Caching

BscotchMonday caches data but has no automatic cache-updating
behavior. Where relevant, instanced classes have a `.refresh()`
method that will fetch up-to-date data at that heirarchical level.
If you are using long-lived instances (which would be a good idea,
since a lot of data has to be fetched on MondayBoard instancing)
you may also want to set up some refresh logic.

```ts
// Perhaps refresh the board before doing new things, if
// the prior stuff took a while
await board.refresh();

// ... or set an interval to guarantee freshness
setInterval(board.refresh, 60000); // refresh every minute

// Or if you are tracking a specific Item and need to
// make sure your data is up to date before making a change
await item.refresh();
// ... do some stuff to the item
await item.save();
```

## Testing

Testing acts against the live Monday.com servers to ensure
that behavior matches how Monday.com currently works.

To test, set up a root .env file and specify the environment
variables you see in `./src/test/index.ts` to match your
Monday.com test account.
