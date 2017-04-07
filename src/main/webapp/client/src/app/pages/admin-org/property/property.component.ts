import {Component} from "@angular/core";
import {Router, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs/Rx';
import { GlobalState } from '../../../global.state';
import { RouteService } from '../../../service/route';

@Component({
  selector: 'property',
  styles: [require('./property.scss')],
  template: require('./property.html')
})
export class Property {
  protected _onRouteChange:Subscription;
  tab: string = 'case-type';
  status: string = 'list';

  constructor(private _router:Router, private _state: GlobalState, private _routeService: RouteService) {

    this._onRouteChange = this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.url) {
        console.log(event.url.split('property/'));

        let arr = event.url.split('property/')[1].split('/');
        this.tab = arr[0];
        this.status = arr[1];
      }
    });
  }

  ngOnInit() {

  }

  selectTab(tab: string) {
    this.tab = tab;
    this._routeService.navTo("/pages/org-admin/property/" + this.tab + "/list");
  }

  create() {
    this.status = 'edit';
    this._routeService.navTo("/pages/org-admin/property/" + this.tab + "/edit/null");

    console.log("/pages/org-admin/property/" + this.tab + "/edit/null");
  }
  back() {
    this.status = 'list';
    this._routeService.navTo("/pages/org-admin/property/" + this.tab + "/list");

    console.log("/pages/org-admin/property/" + this.tab + "/edit/null");
  }

}