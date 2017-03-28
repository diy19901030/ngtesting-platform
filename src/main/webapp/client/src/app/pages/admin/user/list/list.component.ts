import {Component, ViewEncapsulation, OnInit, AfterViewInit, ViewChild, ElementRef} from "@angular/core";
import { FormBuilder, FormGroup } from '@angular/forms';
import {GlobalState} from "../../../../global.state";

import {CONSTANT} from "../../../../utils/constant";
import {Utils} from "../../../../utils/utils";
import {RouteService} from "../../../../service/route";
import {UserService} from "../../../../service/user";

@Component({
  selector: 'user-list',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./list.scss')],
  template: require('./list.html')
})
export class UserList implements OnInit, AfterViewInit {

  queryForm: FormGroup;
  queryModel:any = {keywords: '', disabled: 'false'};
  statusMap: Array<any> = CONSTANT.EntityDisabled;

  models: any;
  totalItems:number = 0;
  currentPage:number = 1;
  itemsPerPage:number = 6;

  constructor(private _routeService:RouteService, private _state:GlobalState, private fb: FormBuilder, private el: ElementRef,
              private userService:UserService) {
  }

  ngOnInit() {
    let that = this;

    that.queryForm = that.fb.group(
      {
        'disabled': [that.queryModel.disabled, []],
        'keywords': [that.queryModel.keywords, []]
      }, {}
    );

    that.loadData();
  }

  ngAfterViewInit() {
    let that = this;

    this.queryForm.valueChanges.debounceTime(500).subscribe(values => this.queryChange(values));
  }

  create():void {
    let that = this;

    that._routeService.navTo("/pages/user/edit/null");
  }

  queryChange(values:any):void {
    let that = this;

    // that.queryModel = values;

    that.loadData();
  }
  pageChanged(event:any):void {
    let that = this;
    that.loadData();
  }

  edit($event: any):void {
    let that = this;

    console.log($event);
  }
  delete($event: any):void {
    let that = this;

    console.log($event);
  }

  loadData() {
    let that = this;

    that.userService.list(that.queryModel).subscribe((json:any) => {
      that.totalItems = json.totalItems;
      that.models = json.data;
    });
  }

}