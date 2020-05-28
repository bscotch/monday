import type {MondayGroup} from "./MondayGroup";
import { MondayColumnValueInfo, MondayColumnValue } from "./MondayColumnValue";
import {deeplog,stringsAreEqual} from "../util";
import assert from "assert";

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

  get id(){ return this._id;}
  get name(){ return this._name;}
  get values(){ return [...this._values];}
  get board(){
    return this._group.board;
  }
  get tags(){
    return this._group.board.tags;
  }
  get boardId(){
    return this._group.boardId;
  }
  get api(){
    return this._group.api;
  }

  getColumnByName(columnName:string){
    return this._group.board.getColumnByName(columnName);
  }

  getColumnValueByName(columnName: string){
    return this._values.find(value=>stringsAreEqual(value.name,columnName));
  }

  async save(){
    // If no _id, need to create.
    let query;
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
      const columnValues = item.column_values as MondayColumnValueInfo[];
      this._internalizeColumnValues(columnValues);
    }
    else{
      // Then the item exists and we need to sync its state.
      // This includes any *changed* column values.
      const updatedColumns = this._values
        .filter(value=>value.changed);
      if(!updatedColumns.length){
        console.log("Skipping save -- no columns changed");
      }
      // Need to DOUBLE-JSON-encode in order to escape quotes.
      const updatedColumnsString = JSON.stringify(JSON.stringify(
        updatedColumns.reduce((asMap,column)=>{
          asMap[column.id as string] = column.value;
          return asMap;
        },{} as {[columnId:string]:any})
      ));
      const query = `mutation {
        change_multiple_column_values (board_id: ${this.boardId}, item_id: ${this.id}, column_values: ${updatedColumnsString}) {
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
      if(!res.change_multiple_column_values){
        throw new Error("Item not updated");
      }
      const columnValues: MondayColumnValueInfo[] = res.change_multiple_column_values.column_values;
      this._internalizeColumnValues(columnValues);
    }
    return this;
    // TODO: if column values, UPDATE
  }

  /** Update cached data with what's on the server (will clear any unsaved changes!) */
  async refresh(){
    assert(this.id,'Item cannot be refreshed -- it has no ID');
    const query = `query {
      items (ids: [${this.id}]) {
        column_values {
          id
          value
          type
          title
        }
      }
    }`;
    const res = await this.api(query);
    assert(Array.isArray(res.items) && res.items.length==1,
      'Refresh failed to find this item');
    this._internalizeColumnValues(res.items[0].column_values as MondayColumnValueInfo[]);
  }

  private _internalizeColumnValues(columnValues: MondayColumnValueInfo[]){
    for(const column of columnValues){
      // Column already exists?
      const existingColumnValue = this._values.find(value=>value.id==column.id);
      if(!existingColumnValue){
        this._values.push(new MondayColumnValue({
          item: this,
          id: column.id,
          title: column.title,
          type: column.type,
          value: column.value
        }));
      }
      else{
        existingColumnValue.updateWithRemoteData(column);
      }
    }
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