import { MondayUser } from "./MondayUser";
import { MondayTag } from "./MondayTag";
import { stringsAreEqual } from "../util";
import { MondayBoard } from "./MondayBoard";
import fetch from "cross-fetch";

interface MondayAccountSearchResponse {
  users: MondayUser[],
  tags: MondayTag[],
  boards: {
    id: string,
    name: string,
  }[]
}

export class MondayAccount {
  private _token: string;
  private _users: MondayUser[] = [];
  private _tags: MondayTag[] = [];
  private _boards: MondayBoard[] = [];

  constructor(options:{token?: string}){
    this._token = options.token || process.env.MONDAY_API_TOKEN || "";
    if(!this._token){
      throw new Error("An API token is required.");
    }
  }

  get api(){
    // Children need to call this function so the `this` context
    // must be forced to the Board.
    return this._api.bind(this);
  }
  get users(){
    return [...this._users];
  }
  get tags(){
    return [...this._tags];
  }

  getBoardById(id:string){
    return this._boards.find(board=>board.id==id);
  }

  getUserById(id:number){
    return this._users.find(user=>user.id==id);
  }

  getUserByEmail(email:string){
    return this._users.find(user=>user.email==email);
  }

  getTagByName(tagName: string){
    return this._tags.find(tag=>stringsAreEqual(tag.name, tagName));
  }

  private async _api(query:string){
    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify({query}),
      headers: {
        Authorization: this._token,
        "Content-Type": "application/json"
      }
    };
    const res = await fetch(`https://api.monday.com/v2`,fetchOptions);
    const body = await res.json();
    const data = body.data;
    if(!data){
      console.log(body);
      throw new Error(`Response failed with status: ${res.status}`);
    }
    return data;
  }


  /** Update properties (such as users, groups, column definitions)
   *  with up-to-date values from Monday.com */
  async pull(){
    const accountInfo = await this.getAccountInfo();

    // Users (don't replace the objects -- update them!)
    for(const userInfo of accountInfo.users){
      const existingUser = this.getUserById(userInfo.id);
      if(!existingUser){
        this._users.push(new MondayUser(userInfo));
      }
      else{
        existingUser.updateWithRemoteData(userInfo);
      }
    }
    //   nuke deprecated users
    for(let i=this._users.length-1 ; i> -1; i--){
      if( ! accountInfo.users.find(user=>user.id==this._users[i].id)){
        this._users.splice(i,1);
      }
    }

    // Tags
    this._tags = accountInfo.tags
      .map(tag=>new MondayTag(tag));

    // Boards
    // (don't replace boards, just update them!)
    for(const boardInfo of accountInfo.boards){
      const existingBoard = this._boards.find(b=>b.id==boardInfo.id);
      if(!existingBoard){
        const newBoard = new MondayBoard({
          id: boardInfo.id,
          name: boardInfo.name,
          account: this,
        });
        this._boards.push(newBoard);
        // Since this is the first time we have it, load its data
        await newBoard.pull();
      }
      else{
        existingBoard.updateWithRemoteData(boardInfo);
      }
    }
    //   nuke deprecated boards
    for(let i=this._boards.length-1 ; i> -1; i--){
      if( ! accountInfo.boards.find(b=>b.id==this._boards[i].id)){
        this._boards.splice(i,1);
      }
    }

    return this;
  }

  /** Retrieve the columns from a board so that its types are known
   * @param {string} boardId
   */
  private async getAccountInfo(){
    const query = `query {
      tags {
        id
        name
        color
      }
      boards {
        id
        name
        groups {
          id
          title
        }
        columns {
          id
          title
          type
          archived
        }
      }
      users (kind: non_guests) {
        id
        name
        email
      }
    }`;
    const data: MondayAccountSearchResponse = await this.api(query);
    if(!data.users?.length || !data.boards?.length){
      throw new Error("Could not find account data. Make sure at least one board exists.");
    }
    const board = data.boards[0];return {
      id: board.id,
      name: board.name,
      users: data.users,
      tags: data.tags,
      boards: data.boards
    };
  }

  get asObject(){
    return {
      users: this._users.map(user=>user.asObject),
      tags: this._tags.map(tag=>tag.asObject),
    };
  }
  toObject(){
    return this.asObject;
  }
}

export async function loadMondayAccount (token?:string){
  const account = new MondayAccount({token});
  await account.pull();
  return account;
}