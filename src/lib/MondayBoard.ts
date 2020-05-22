import fetch from "cross-fetch";
import {MondayUser} from "./MondayUser";
import {MondayBoardGroup} from "./MondayBoardGroup";
import {MondayBoardColumn} from "./MondayBoardColumn";

export interface MondayBoardOptions {
  /** Required to identify the board. */
  id: string,
  /** API Token (required to actually talk to Monday.com)
   * Can also be set with env var MONDAY_API_TOKEN */
  token?: string
}

interface MondayBoardSearchResponse {
  users: MondayUser[],
  boards: {
    id: string,
    name: string,
    groups: (MondayBoardGroup & {archived?:boolean,deleted?:boolean})[],
    columns:(MondayBoardColumn & {archived?:boolean})[]
  }[]
}

class MondayBoard {

  private _id = "";
  private _name = "";
  private _token = "";
  private _columns: MondayBoardColumn[] = [];
  private _users: MondayUser[] = [];
  private _groups: MondayBoardGroup[] = [];

  constructor (options: MondayBoardOptions){
    if(!options.id){
      throw new Error("Board id is required!");
    }
    this._token = options.token || process.env.MONDAY_API_TOKEN || "";
    if(!this._token){
      throw new Error("An API token is required.");
    }
    if(options.id){
      this._id = options.id;
    }
  }


  get id(){
    return this._id;
  }
  get name(){
    return this._name;
  }
  get users(){
    return [...this._users];
  }
  get groups(){
    return [...this._groups];
  }
  get columns(){
    return [...this._columns];
  }
  get asObject(){
    return {
      id: this._id,
      name: this._name,
      users: this._users.map(user=>user.asObject),
      groups: this._groups.map(group=>group.asObject),
      columns: this._columns.map(column=>column.asObject),
    };
  }
  toObject(){
    return this.asObject;
  }

  /** Update properties (such as users, groups, column definitions)
   *  with up-to-date values from Monday.com */
  async refresh(){
    const boardInfo = await this.getBoardInfo();
    this._id = boardInfo.id;
    this._name = boardInfo.name;
    this._users = boardInfo.users
      .map(userInfo=> new MondayUser(userInfo));
    this._groups = boardInfo.groups
      .map(groupInfo=> new MondayBoardGroup(groupInfo));
    this._columns = boardInfo.columns
      .map(columnInfo=> new MondayBoardColumn(columnInfo));
    return this;
  }

  /** Retrieve the columns from a board so that its types are known
   * @param {string} boardId
   */
  private async getBoardInfo(){
    const query = `query {
      boards (ids: ${this._id}) {
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
    const data: MondayBoardSearchResponse = await this.api(query);
    if(!data.users?.length || !data.boards?.length){
      throw new Error("Could not find board.");
    }
    const board = data.boards[0];
    // Remove archived/deleted stuff
    board.groups = board.groups.filter(group=>!group.archived && !group.deleted);
    board.columns = board.columns.filter(column=>!column.archived);
    return {
      id: board.id,
      name: board.name,
      users: data.users,
      groups: board.groups,
      columns: board.columns
    };
  }

  private async api(query:string){
    const res = await fetch(`https://api.monday.com/v2`,{
      method: 'POST',
      body: JSON.stringify({query}),
      headers: {
        Authorization: this._token,
        "Content-Type": "application/json"
      }
    });
    const data = (await res.json()).data;
    return data;
  }
}

/** Instance a MondayBoard object by fetching summary data */
export async function fetchMondayBoard(options:MondayBoardOptions){
  const board = new MondayBoard(options);
  await board.refresh();
  return board;
}

