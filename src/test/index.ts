import {expect} from "chai";
import {inspect} from "util";
import dotenv from "dotenv";
import path from "path";
const envPath = path.resolve(process.cwd(),'.env');
dotenv.config({path:envPath});

import { fetchMondayBoard, MondayBoard } from "../lib/MondayBoard";
import type { MondayGroup } from "../lib/MondayGroup";
import type { MondayItem } from "../lib/MondayItem";

const testBoardId   = process.env.TEST_BOARD_ID || '577318853';
const testBoardName = process.env.TEST_BOARD_NAME || 'Automation Experiments';
const testGroupName = process.env.TEST_GROUP_NAME || 'Things to do';
const testItemName  = process.env.TEST_ITEM_NAME || 'This is only a test';

function deeplog (something:any){
  console.log(inspect(something,false,null));
}

describe("Tests",async function(){
  let board: MondayBoard;
  let item: MondayItem;

  before(async function(){
    board = await fetchMondayBoard({id: testBoardId});
  });

  it("can instance a board object",async function(){
    expect(board.id).to.equal(testBoardId);
    expect(board.name).to.equal(testBoardName);
    const boardFields = ['users','columns','groups'] as const;
    for(const field of boardFields){
      expect(board[field]).to.have.length.greaterThan(0);
    }
  });

  it("can create an item",async function(){
    const group = board.getGroupByName(testGroupName) as MondayGroup;
    expect(group,'Group should be discoverable by name').to.exist;
    item = await group.createItem(testItemName);
  });

  after(async function(){
    // item.delete();
  });
});
