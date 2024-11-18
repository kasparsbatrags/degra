import {Component, OnInit} from '@angular/core'
import {HeaderComponent} from './header/header.component'
import {SearchHistoryComponent} from './search-history/search-history.component'
import {SearchResultsComponent} from './search-results/search-results.component'
import {SearchComponent} from './search/search.component'

declare var M: any;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    HeaderComponent,
    SearchComponent,
    SearchResultsComponent,
    SearchHistoryComponent
  ],
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  ngOnInit() {
    document.addEventListener('DOMContentLoaded', function() {
      const elems = document.querySelectorAll('.sidenav');
      const instances = M.Sidenav.init(elems);
    });
  }
}
