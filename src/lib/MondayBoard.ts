import {MondayGroup} from "./MondayGroup";
import {MondayColumn} from "./MondayColumn";
import { stringsAreEqual } from "../util";
import type { MondayAccount } from "./MondayAccount";

interface MondayBoardSearchResponse {
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
  private _account: MondayAccount;
  private _columns: MondayColumn[] = [];
  private _groups: MondayGroup[] = [];

  constructor (options: {id: string, name: string, account: MondayAccount}){
    if(!options.id){
      throw new Error("Board id is required!");
    }
    this.updateWithRemoteData(options);
    this._account = options.account;
  }

  get api(){
    // Children need to call this function so the `this` context
    // must be forced to the Board.
    return this._account.api;
  }
  get account(){ return this._account; }
  get id(){ return this._id; }
  get name(){ return this._name; }
  get groups(){ return [...this._groups]; }
  get columns(){ return [...this._columns]; }

  get asObject(){
    return {
      id: this._id,
      name: this._name,
      groups: this._groups.map(group=>group.asObject),
      columns: this._columns.map(column=>column.asObject),
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

  updateWithRemoteData(options: Partial<{id:string,name:string}>){
    this._id = options.id || this.id;
    this._name = options.name || this.name;
  }

  /** Update properties (such as users, groups, column definitions)
   *  with up-to-date values from Monday.com */
  async pull(){
    const boardInfo = await this.getBoardInfo();
    this._id = boardInfo.id;
    this._name = boardInfo.name;

    // Groups
    this._groups = boardInfo.groups.map(groupInfo=> new MondayGroup({
      title: groupInfo.title,
      id: groupInfo.id,
      board: this
    }));

    // Columns (definitions)
    this._columns = boardInfo.columns
      .map(columnInfo=> new MondayColumn(columnInfo));
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
    }`;
    const data: MondayBoardSearchResponse = await this.api(query);
    const board = data.boards[0];
    // Remove archived/deleted stuff
    board.groups = board.groups.filter(group=>!group.archived && !group.deleted);
    board.columns = board.columns.filter(column=>!column.archived);
    return {
      id: board.id,
      name: board.name,
      groups: board.groups,
      columns: board.columns,
    };
  }
}
