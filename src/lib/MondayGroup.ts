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
  get board() { return this._board; }
  get boardId() { return this._board.id; }
  get columns() { return [...this._board.columns]; }
  get api() { return this._board.api; }

  // Items are created in a group.
  async createItem(name:string){
    const newItem = new MondayItem({name, group: this});
    await newItem.push();
    return newItem;
  }

  /** Monday.com does not natively provide search-by-name. Have to instead fetch all active results in the Group until one matches. */
  async findItemByName(name:string){
    let page = 1;
    let item: MondayItem|undefined;
    while(true){
      const query = `query {
        boards (ids: ${this.boardId}) {
          groups (ids: ${this.id}) {
            items (page: ${page}){
              id
              name
            }
          }
        }
      }`;
      const items = ((await this.api(query))?.boards[0]?.groups[0]?.items ||[]) as {id:string,name:string}[];
      if(!items.length){
        break;
      }
      const matchingItem = items.find(item=>item.name.toLowerCase().trim() == name.toLowerCase().trim());
      if(matchingItem){
        item = new MondayItem({group:this,...matchingItem});
        await item.pull();
        break;
      }
      page++ ;
    }
    return item;
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
