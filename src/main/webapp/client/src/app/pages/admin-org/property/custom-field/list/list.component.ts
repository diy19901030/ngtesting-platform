import {Component, ViewEncapsulation, OnInit, AfterViewInit, ViewChild, ElementRef} from "@angular/core";
import { FormBuilder, FormGroup } from '@angular/forms';
import {GlobalState} from "../../../../../global.state";

import {CONSTANT} from "../../../../../utils/constant";
import {Utils} from "../../../../../utils/utils";
import {RouteService} from "../../../../../service/route";
import {CustomFieldService} from "../../../../../service/custom-field";

@Component({
  selector: 'custom-field-list',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./list.scss')],
  template: require('./list.html')
})
export class CustomFieldList implements OnInit, AfterViewInit {

  queryForm: FormGroup;
  queryModel:any = {keywords: '', disabled: 'false'};
  statusMap: Array<any> = CONSTANT.EntityDisabled;

  models: any;
  totalItems:number = 0;
  currentPage:number = 1;
  itemsPerPage:number = 6;

  constructor(private _routeService:RouteService, private _state:GlobalState, private fb: FormBuilder, private el: ElementRef,
              private customFieldService: CustomFieldService) {
  }

  ngOnInit() {
    let that = this;

    that.queryForm = that.fb.group(
      {
        'disabled': ['', []],
        'keywords': ['', []]
      }, {}
    );

    that.loadData();
  }

  ngAfterViewInit() {
    let that = this;

    this.queryForm.valueChanges.debounceTime(CONSTANT.DebounceTime).subscribe(values => this.queryChange(values));
  }

  create():void {
    let that = this;

    that._routeService.navTo("/pages/org-admin/field/edit/null");
  }

  queryChange(values:any):void {
    let that = this;

    that.loadData();
  }
  pageChanged(event:any):void {
    this.currentPage = event.page;
    this.loadData();
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

    that.customFieldService.list(that.queryModel, that.currentPage, that.itemsPerPage).subscribe((json:any) => {
      that.totalItems = json.totalItems;
      that.models = json.data;
    });
  }

}
