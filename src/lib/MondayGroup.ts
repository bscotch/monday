import type {MondayBoard} from "./MondayBoard";
import { MondayItem } from "./MondayItem";

export class MondayGroup {
  private _id = "";
  private _title = "";
  private _board: MondayBoard;

  constructor(options:{id:string,title:string,board: MondayBoard}){
    this._id = options.id;
    this._title = options.title;
    this._board = options.board;
  }

  get id() { return this._id; }
  get title() { return this._title; }
  get boardId() { return this._board.id; }
  get columns() { return [...this._board.columns]; }
  get api() { return this._board.api; }

  // Items are created in a group.
  async createItem(name:string){
    const newItem = new MondayItem({name, group: this});
    await newItem.save();
    return newItem;
  }

  get asObject(){
    return {
      id: this._id,
      title: this._title
    };
  }
  toObject(){
    return this.asObject;
  }
}
