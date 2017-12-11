import { Input, Component, OnInit, OnDestroy, AfterViewInit, Renderer2, EventEmitter, Output, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';

import {GlobalState} from "../../../global.state";
import { Deferred, getDeepFromObject } from './helpers';

import { CONSTANT } from '../../../utils/constant';
import { Utils } from '../../../utils/utils';

import { ZtreeService } from './ztree.service';

declare var jQuery;

@Component({
  selector: 'ztree',
  templateUrl: './ztree.html',
  styleUrls: ['./styles.scss',
    '../../../../assets/vendor/ztree/css/zTreeStyle/zTreeStyle.css'],
  providers: [ZtreeService]
})
export class ZtreeComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  treeSettings: any;
  settings: any;

  @Output() renameEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() removeEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() moveEvent: EventEmitter<any> = new EventEmitter<any>();

  private disposersForDragListeners:Function[] = [];

  _treeModel: any;
  ztree: any;
  checkCount: number;
  keywordsControl = new FormControl();
  keywords: string = '';
  isExpanded: boolean = false;
  sonSign: boolean = false;
  isDragging: boolean = false;
  isToCopy: boolean = false;

  log: any;
  newCount: number = 0;
  className: string = "dark";
  autoExpandNode: any;

  @Input() set treeModel(model: any) {
    if(!model) {
      return;
    }

    _.merge(this.settings, this.treeSettings);
    this.isExpanded = this.settings.isExpanded;
    this.sonSign = this.settings.sonSign;

    if (this.settings.usage == 'selection' || this.settings.usage == 'exe') {
      this.settings.view.addHoverDom = null;
      this.settings.view.removeHoverDom = null;
      this.settings.edit.enable = false;
    }
    if (this.settings.usage == 'selection') {
      this.settings.check = {
        enable: true,
        chkboxType: {"Y": "ps", "N": "ps"}
      }
    }

    this._treeModel = model;
    this.ztree = jQuery.fn.zTree.init($('#tree'), this.settings, this._treeModel);
    this.ztree.expandNode(this.ztree.getNodes()[0], this.isExpanded, this.sonSign, true);

    if (this.settings.jumpTo) {
      this.jumpTo(this.settings.jumpTo);
    }
  }

  public constructor(private _state:GlobalState, @Inject(Renderer2) private renderer:Renderer2,
                     @Inject(ZtreeService) private ztreeService: ZtreeService) {

    this.settings = {
      usage: null,
      isExpanded: null,

      view: {
        addHoverDom: this.addHoverDom,
        removeHoverDom: this.removeHoverDom,
        selectedMulti: false,
        fontCss: this.setFontCss
      },
      edit: {
        enable: true,
        editNameSelectAll: true,
        showRemoveBtn: true,
        showRenameBtn: true,
        renameTitle: "编辑",
        removeTitle: "删除",
        drag: {
          autoExpandTrigger: true
        }
      },
      data: {
        simpleData: {
          enable: true
        }
      },
      callback: {
        onClick: this.onClick,
        beforeRemove: this.beforeRemove,
        onRemove: this.onRemove,
        onRename: this.onRename,
        onDrag: this.onDrag,
        beforeDrop: this.beforeDrop,
        onDrop: this.onDrop,
        onCheck: this.onCheck,
        onExpand: this.onExpand
      }
    };


  }

  public ngOnInit(): void {
    this.keywordsControl.valueChanges.debounceTime(CONSTANT.DebounceTime).subscribe(values => this.onKeywordsChange(values));

    this._state.subscribe('case.jump', (id: number) => {
      console.log('case.jump');
      this.jumpTo(id);
    });

    this._state.subscribe('case.save', (data: any) => {
      let testCase = data.node;

      if (testCase) {
        var node = this.ztree.getNodeByParam("id", testCase.id, null);

        node.name = testCase.name;
        node.status = testCase.status;
        this.ztree.updateNode(node);
      }
    });
  }

  ngAfterViewInit() {
    this.disposersForDragListeners.push(this.renderer.listen('document', 'keyup', this.copyKeyup.bind(this)));
    this.disposersForDragListeners.push(this.renderer.listen('document', 'keydown', this.copyKeyDown.bind(this)));
  }
  copyKeyup(e):any {
    this.isToCopy = false;
  }
  copyKeyDown(e):any {
    this.isToCopy = true;
  }
  public ngOnDestroy():void {
    this.disposersForDragListeners.forEach(dispose => dispose());
  }

  expandOrNot() {
    if (!(this.isExpanded && this.sonSign)) {
      this.isExpanded = true;
      this.sonSign = true;

      this.ztree.expandAll(true);
    } else {
      this.isExpanded = true;
      this.sonSign = false;

      this.ztree.expandAll(false);
    }
  }

  setFontCss (treeId, treeNode) {
    console.log('treeNode.status', treeNode.status);

    let css:any = {};
    if (treeNode.status == 'pass') {
      css.color = '#209e91';
    } else if (treeNode.status == 'fail') {
      css.color = '#e85656';
    } else if (treeNode.status == 'block') {
      css.color = '#dfb81c';
    }
    return css;
  }
  onClick = (event, treeId, treeNode) => {
    this.notifyCaseChange(treeNode);
  }
  notifyCaseChange = (node: any)  => {
    this._state.notifyDataChanged('case.' + this.settings.usage, {node: node, random: Math.random()});
  }

  addHoverDom = (treeId, treeNode) => {
    var sObj = $("#" + treeNode.tId + "_span");
    if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
    var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
      + "' title='添加' onfocus='this.blur();'></span>";
    sObj.after(addStr);

    var btn = jQuery("#addBtn_"+treeNode.tId);
    if (btn) btn.bind("click", () => {
      let newNode = this.ztree.addNodes(treeNode, {id: -1 * this.newCount++, pId:treeNode.id, name:"新用例",
        type: "functional", priority: 2, estimate: undefined});
      this.ztree.editName(newNode[0]);
      return false;
    });
  }
  removeHoverDom = (treeId, treeNode) => {
    $("#addBtn_"+treeNode.tId).unbind().remove();
  }

  onRename = (e, treeId, treeNode, isCancel) => {
    const deferred = new Deferred();
    deferred.promise.then((data) => {
      console.log('success to rename', data);
      treeNode.id = data.id;
      treeNode.ordr = data.ordr;

      treeNode.tm = new Date().getTime();

      this._state.notifyDataChanged('case.' + this.settings.usage, {node: _.clone(treeNode), random: Math.random()});
    }).catch((err) => {console.log('err', err);});

    this.renameEvent.emit({
      data: treeNode,
      deferred: deferred,
    });
  }

  beforeRemove = (treeId, treeNode) => {
    this.className = (this.className === "dark" ? "":"dark");
    this.ztree.selectNode(treeNode);
    return confirm('确认删除名为"' + treeNode.name + '"的用例吗？');
  }
  onRemove = (e, treeId, treeNode) => {
    const deferred = new Deferred();
    deferred.promise.then((data) => {
      console.log('success to remove', treeNode);
      this._state.notifyDataChanged('case.change', {node: null, random: Math.random()});
    }).catch((err) => {console.log('err', err);});

    this.removeEvent.emit({
      data: treeNode,
      deferred: deferred,
    });
  }
  onDrag = (event, treeId, treeNodes) => {
    this.isDragging = true;
  }

  beforeDrop = (treeId, treeNodes, targetNode, moveType, isCopy) => {
    this.isDragging = false;
    if (targetNode.level == 0 && moveType != 'inner') {
      return false;
    } else {
      return true;
    }
  }
  onDrop = (event, treeId, treeNodes, targetNode, moveType, isCopy) => {
    if(!targetNode) {
      return;
    }

    const deferred = new Deferred();
    deferred.promise.then((data) => {
      console.log('success to move', data);
      this._state.notifyDataChanged('case.change', {node: data, random: Math.random()});

      if (isCopy) {
        let parentNode;
        if (moveType == 'inner') {
          parentNode = targetNode;
        } else {
          parentNode = targetNode.getParentNode();
        }
        console.log('parentNode', parentNode);
        let copyiedNode = this.ztree.getNodesByParam("id", treeNodes[0].id, parentNode)[0];
        console.log('copyiedNode', copyiedNode);

        copyiedNode.id = data.id;
        copyiedNode.pId = data.pId;

        if (treeNodes[0].isParent) {
          // 更新新节点的属性
          this.updateCopiedNodes(copyiedNode, data);
        }
      }

    }).catch((err) => {console.log('err', err);});

    this.moveEvent.emit({
      data: {srcId: treeNodes[0].id, targetId: targetNode.id, moveType: moveType, isCopy: isCopy},
      deferred: deferred
    });
  }

  onExpand = (event, treeId, treeNode) => {
    if (treeNode === this.autoExpandNode) {
      this.className = (this.className === "dark" ? "":"dark");
    }
  }
  onCheck = () => {
    let i = 0;
    this.ztree.getCheckedNodes(true).forEach((value, index, array) => {
      if(!value.isParent) {
        i++;
      }
    });
    this.checkCount = i;
  }
  selectAll = () => {
    this.ztree.checkAllNodes(true);
    this.onCheck();
  }
  reset = () => {
    this.ztree.checkAllNodes(false);
    this.onCheck();
  }

  getTime = () => {
    var now= new Date(),
      h=now.getHours(),
      m=now.getMinutes(),
      s=now.getSeconds(),
      ms=now.getMilliseconds();
    return (h+":"+m+":"+s+ " " +ms);
  }

  onKeywordsChange(values) {
    this.keywords = values;
    let nodes = this.ztree.getNodesByParam("isHidden", true);
    this.ztree.showNodes(nodes);

    nodes = this.ztree.getNodesByFilter((node) => {
      return this.keywords && !node.isParent && node.name.indexOf(this.keywords) < 0;
    });
    this.ztree.hideNodes(nodes);
  }

  updateCopiedNodes(node: any, data: any) {
    console.log('===',  node.id, data.id);

    node.id = data.id;
    node.pId = data.pId;

    for(let i=0; i<node.children.length; i++) {
      this.updateCopiedNodes(node.children[i], data.children[i]);
    }
  }
  jumpTo(id: number) {
    var node = this.ztree.getNodeByParam("id", id, null);
    this.ztree.selectNode(node);
    this.notifyCaseChange(node);
  }

}