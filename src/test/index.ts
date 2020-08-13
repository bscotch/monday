import {expect} from "chai";
import dotenv from "dotenv";
import path from "path";
const envPath = path.resolve(process.cwd(),'.env');
// import {deeplog} from "../util";
dotenv.config({path:envPath});

import {loadMondayAccount, MondayAccount} from "../lib/MondayAccount";
import { MondayBoard } from "../lib/MondayBoard";
import type { MondayGroup } from "../lib/MondayGroup";
import type { MondayItem } from "../lib/MondayItem";
import { MondayColumnValue } from "../lib/MondayColumnValue";
import { MondayColumnType, MondayColumn } from "../lib/MondayColumn";

const testBoardId   = process.env.TEST_BOARD_ID || '577318853';
const testBoardName = process.env.TEST_BOARD_NAME || 'Automation Experiments';
const testGroupName = process.env.TEST_GROUP_NAME || 'Things to do';
const testItemName  = process.env.TEST_ITEM_NAME || 'This is only a test';
const testTagColumnName = process.env.TEST_COLUMN_NAME || 'tags';
const testTagName = process.env.TEST_TAG_NAME || 'bugfix';

describe("Tests",async function(){
  let account: MondayAccount;
  let board: MondayBoard;
  let item: MondayItem;

  before(async function(){
    this.timeout(5000);
    account = await loadMondayAccount();
    expect(account,'Account must exist').to.exist;
    board = account.getBoardById(testBoardId) as MondayBoard;
    expect(board,'Board must exist').to.exist;
  });

  it("can get users from account",function(){
    expect(account.users,'Must be at least one user')
      .to.have.length.greaterThan(0);
  });

  it("can get tags from account", function(){
    expect(account.tags,'Must be at least one tag')
      .to.have.length.greaterThan(0);
    expect(account.tags.some(tag=>tag.name.toLowerCase()==testTagName.toLowerCase()),
      'Tags must include test tag'
    ).to.be.true;
  });

  it("can instance a board object",async function(){
    this.timeout(5000);
    expect(board.id).to.equal(testBoardId);
    expect(board.name).to.equal(testBoardName);
    const boardFields = ['columns','groups'] as const;
    for(const field of boardFields){
      expect(board[field]).to.have.length.greaterThan(0);
    }
  });

  it("can create an item",async function(){
    this.timeout(5000);
    const group = board.getGroupByName(testGroupName) as MondayGroup;
    expect(group,'Group should be discoverable by name').to.exist;
    item = await group.createItem(testItemName);
    expect(item.id,'Item should have been created').to.be.a('string');
  });

  it("can update column values",async function(){
    this.timeout(8000);

    // Tags
    const itemTagColumnValue = item.getColumnValueByName(testTagColumnName) as MondayColumnValue;
    expect(itemTagColumnValue,'Test tag column must exist').to.exist;
    expect(itemTagColumnValue.type).to.equal('tag');
    itemTagColumnValue.setTags(testTagName);
    expect(itemTagColumnValue.value).to.have.property('tag_ids');
    const tagIds = (itemTagColumnValue.value as {tag_ids:number[]}).tag_ids;
    expect(tagIds.length,'Must have a tag added').to.equal(1);
    expect(tagIds.every(tagId=>typeof tagId == 'number'),'tagIds should be numbers');

    // Save changes
    await item.push();
    // After saving, item still has the new value and is no longer flagged as changed.
    expect((itemTagColumnValue.value as {tag_ids:number[]}).tag_ids,'tags should be set after push')
      .to.have.length.greaterThan(0);
    expect(itemTagColumnValue.changed,`'changed' should get unflagged after push`)
      .to.be.false;

    // Refresh
    await item.pull();
    expect((itemTagColumnValue.value as {tag_ids:number[]}).tag_ids,'tags should be set after refresh')
      .to.have.length.greaterThan(0);
    expect(itemTagColumnValue.changed,`'changed' should get unflagged after refresh`)
      .to.be.false;
  });

  it("can search for an item", async function(){
    this.timeout(5000);
    const group = item.group;
    const textColumn = group.columns.find(column=>column.type==MondayColumnType.Text) as MondayColumn;
    expect(textColumn,'There should be a text column').to.exist;
    const searchValue = "This is some text";
    const columnValue = item.getColumnValueByName(textColumn.title) as MondayColumnValue;
    expect(columnValue,'Column value should exist').to.exist;
    columnValue.setText(searchValue);
    await item.push();

    // Do a search
    await item.pull();
    const foundItem = await group.findItemByColumnValue(textColumn.title,searchValue);
    expect(foundItem,'should be able to find an item by its value').to.exist;
  });

  after(async function(){
    await item.delete();
  });
});
