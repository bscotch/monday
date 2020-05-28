import fetch from "cross-fetch";
import {MondayUser} from "./MondayUser";
import {MondayGroup} from "./MondayGroup";
import {MondayColumn} from "./MondayColumn";
import {MondayTag} from "./MondayTag";
import { deeplog, stringsAreEqual } from "../util";

export interface MondayBoardOptions {
  /** Required to identify the board. */
  id: string,
  /** API Token (required to actually talk to Monday.com)
   * Can also be set with env var MONDAY_API_TOKEN */
  token?: string
}

interface MondayBoardSearchResponse {
  users: MondayUser[],
  tags: MondayTag[],
  boards: {
    id: string,
    name: string,
    groups: (MondayGroup & {archived?:boolean,deleted?:boolean})[],
    columns: (MondayColumn & {archived?:boolean})[]
  }[]
}

export class MondayBoard {

  private _id = "";
  private _name = "";
  private _token = "";
  private _columns: MondayColumn[] = [];
  private _users: MondayUser[] = [];
  private _groups: MondayGroup[] = [];
  private _tags: MondayTag[] = [];

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

  get api(){
    // Children need to call this function so the `this` context
    // must be forced to the Board.
    return this._api.bind(this);
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
  get tags(){
    return [...this._tags];
  }
  get asObject(){
    return {
      id: this._id,
      name: this._name,
      users: this._users.map(user=>user.asObject),
      groups: this._groups.map(group=>group.asObject),
      columns: this._columns.map(column=>column.asObject),
      tags: this._tags.map(tag=>tag.asObject),
    };
  }
  toObject(){
    return this.asObject;
  }

  getGroupByName(groupName: string){
    return this._groups.find(group=>stringsAreEqual(group.title,groupName));
  }

  getColumnByName(columnName: string){
    return this._columns.find(column=>stringsAreEqual(column.title, columnName));
  }

  getTagByName(tagName: string){
    return this._tags.find(tag=>stringsAreEqual(tag.name, tagName));
  }

  /** Update properties (such as users, groups, column definitions)
   *  with up-to-date values from Monday.com */
  async refresh(){
    const boardInfo = await this.getBoardInfo();
    this._id = boardInfo.id;
    this._name = boardInfo.name;
    this._users = boardInfo.users
      .map(userInfo=> new MondayUser(userInfo));
    this._groups = boardInfo.groups.map(groupInfo=> new MondayGroup({
      title: groupInfo.title,
      id: groupInfo.id,
      board: this
    }));
    this._columns = boardInfo.columns
      .map(columnInfo=> new MondayColumn(columnInfo));
    this._tags = boardInfo.tags
      .map(tag=>new MondayTag(tag));
    return this;
  }

  /** Retrieve the columns from a board so that its types are known
   * @param {string} boardId
   */
  private async getBoardInfo(){
    const query = `query {
      tags {
        id
        name
        color
      }
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
      columns: board.columns,
      tags: data.tags
    };
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
}

/** Instance a MondayBoard object by fetching summary data */
export async function fetchMondayBoard(options:MondayBoardOptions){
  const board = new MondayBoard(options);
  await board.refresh();
  return board;
}
