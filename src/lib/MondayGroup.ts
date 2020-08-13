import type {MondayBoard} from "./MondayBoard";
import { MondayItem } from "./MondayItem";
import { MondayColumnType } from "./MondayColumn";

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

  async findItemByColumnValue(columnName:string, columnValue:any){
    const column = this.board.getColumnByName(columnName);
    if(!column){
      throw new Error(`Column ${columnName} does not exist.`);
    }
    const unsearchableColumnTypes = [
      MondayColumnType.Tags,
      MondayColumnType.People,
      MondayColumnType.Dropdown
    ];
    if(unsearchableColumnTypes.includes(column.type)){
      throw new Error(`Column type ${column.type} is not searchable.`);
    }
    const query = `query {
      items_by_column_values (board_id: ${this.boardId}, column_id: ${JSON.stringify(column.id)}, column_value: ${JSON.stringify(columnValue)}) {
        id
        name
      }
    }`;
    const results = await this.api(query);
    const itemData = results.items_by_column_values as {id:string,name:string}[];
    if(itemData[0]){
      const item = new MondayItem({...itemData[0],group:this});
      await item.pull();
      return item;
    }
    return;
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
