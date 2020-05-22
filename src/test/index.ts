import {expect} from "chai";
import {inspect} from "util";
import dotenv from "dotenv";
import path from "path";
const envPath = path.resolve(process.cwd(),'.env');
dotenv.config({path:envPath});

import {fetchMondayBoard} from "../lib/MondayBoard";

const testBoardId = '577318853';
const testBoardName = 'Automation Experiments';

function deeplog (something:any){
  console.log(inspect(something,false,null));
}

describe("Tests",async function(){
  // before(async function(){
  // });

  it("can instance a board object",async function(){
    const board = await fetchMondayBoard({id: testBoardId});
    expect(board.id).to.equal(testBoardId);
    expect(board.name).to.equal(testBoardName);
    for(const field of ['users','columns','groups']){
      // @ts-ignore
      expect(board[field]).to.have.length.greaterThan(0);
    }
    deeplog(board.asObject);
  });

  // after(async function(){

  // });
});
