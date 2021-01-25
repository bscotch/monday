# [DEPRECATED]

We have abandoned this project/module after switching
to a different service.

You're welcome to fork this project and keep it going
if you've found it useful!

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

**Typescript (node.js)**

```ts
import {fetchMondayAccount} from "@bscotch/monday";
const yourMondayAPIToken = 'your private token';

// Load an account in an async function somewhere:
const account = await fetchMondayAccount(yourMondayAPIToken);

// ...or by chaining with `then`:
fetchMondayAccount(yourMondayAPIToken)
  .then(account=>{/** do something */});
```

**JavaScript (node.js):**

```js
const {fetchMondayBoard} = require('@bscotch/monday');

/** @typedef {import('@bscotch/monday').MondayAccount} MondayAccount
 * (load other types similarly for typing via JSDoc)
 * /
```

Your API Token can be specified via the environment
variable `MONDAY_API_TOKEN`, in which case you can leave it
out of the account options.

## Usage

### Model

BscotchMonday creates a heirarchy of classes starting with a MondayAccount. A MondayAccount contains and manages users, tags, boards, and other account-wide data. Each type of complex data has its own class. A MondayBoard
contains a list of MondayGroups, which are the level at which
you'll manage MondayItems.

```ts
// Get an account and account-wide data
const account  = await fetchMondayAccount('your-api-token');
const users    = account.users;
const myUser   = account.getUserByEmail('email@example.com');
const tags     = account.tags;
const myTag    = account.getTagByName('my-tag');

// Get a board and its data
const board    = account.getBoardById('your-board-id');
const groups   = board.groups;
const myGroup  = board.getGroupByName('My Group');
const tags     = board.tags;
const columns  = board.columns;
const myColumn = board.getColumnByName('My Column');

// Items are managed at the Group level
const newItem = await myGroup.createItem('Item name');

// Column Values are managed at the Item level.
// Change sare only submitted upon `item.push()`
const itemCheckbox = newItem.getColumnValueByName("Checkbox Column");
itemCheckbox.setCheckbox(true);
const itemTags = newItem.getColumnValueByName("Tags");
itemTags.setTags(['a-tag','another-tag']); // Must already exist
await newItem.push(); // Submit changed values to Monday.com

await newItem.delete(); // Perhaps you need to clean up after yourself.

```

### Caching

BscotchMonday caches data but has no automatic cache-updating
behavior. Where relevant, instances have a `.pull()`
method that will fetch up-to-date data at that heirarchical level
(and replace local data with it).

If you are using long-lived instances (which would be a good idea,
since a lot of data has to be fetched on MondayBoard instancing)
you may also want to set up some refresh logic.

***WARNING:*** To keep things generally immutable, when you obtain arrays of things (like users, tags, etc) you'll usually end up with a shallow copy. While `.pull()`ed data tries to update instances in-place, it can't update your shallow copies. So always use BscotchMonday getters when you need to guarantee that you have complete and up-to-date data.

```ts
// Refresh the list of users, tags, boards, and any other
// account-wide data
account.pull();

// Perhaps you need a specific board to be refreshed more frequently
// than others. Refresh a specific board:
await board.pull();

// Set an interval to guarantee freshness
setInterval(board.pull, 60000); // refresh every minute

// Make sure your Item is up to date before making a change
// Items must be refreshed individually, since they are not
// stored by any BscotchMonday instances.
await item.pull();
// ... do some stuff to the item
await item.push();
```

## Testing

Testing acts against the live Monday.com servers to ensure
that behavior matches how Monday.com currently works.

To test, set up a root .env file and specify the environment
variables you see in `./src/test/index.ts` to match your
Monday.com test account.
