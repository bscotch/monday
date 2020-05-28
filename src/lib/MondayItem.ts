import type {MondayGroup} from "./MondayGroup";
import { MondayColumnValueInfo, MondayColumnValue } from "./MondayColumnValue";
import {deeplog} from "../util";


export class MondayItem {
  private _id: string|void;
  private _name = "";
  private _group: MondayGroup;
  private _values: MondayColumnValue[] = [];

  constructor(options:{id?:string,name:string,group: MondayGroup}){
    this._id = options.id;
    this._name = options.name;
    this._group = options.group;
  }

  get boardId(){
    return this._group.boardId;
  }
  get api(){
    return this._group.api;
  }

  async save(){
    // If no _id, need to create.
    if(!this._id){
      // Return all field values so we know the full state.
      const query = `mutation {
        create_item (board_id: ${this.boardId}, group_id: "${this._group.id}", item_name: "${this._name}") {
          id
          column_values {
            id
            value
            type
            title
          }
        }
      }`;
      const res = await this.api(query);
      if(!res.create_item){
        throw new Error("Item not created");
      }
      const item = res.create_item;
      this._id = item.id;
      for(const column of item.column_values as MondayColumnValueInfo[]){
        this._values.push(new MondayColumnValue({
          item: this,
          id: column.id,
          title: column.title,
          type: column.type,
          value: column.value
        }));
      }
    }
    return this;
    // TODO: if column values, UPDATE
  }

  get asObject(){
    return {
      id: this._id,
      name: this._name
    };
  }
  toObject(){
    return this.asObject;
  }
}