import {DataSource} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {McFile} from '../../services/directory-service';
import {map,} from 'rxjs/operators';

/**
 * Data source for the DirectoryList view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class DirectoryListDataSource extends DataSource<McFile> {
  sort: MatSort | undefined;

  private dirListSubject = new BehaviorSubject<McFile[]>([]);

  constructor() {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<McFile[]> {
    if(this.sort== undefined) throw "sort undefined";
    return merge(this.dirListSubject.asObservable(),this.sort.sortChange).pipe(
      map( () => this.getSortedData(this.dirListSubject.value) )
    );
  }




  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(): void {
    this.dirListSubject.complete();
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: McFile[]  ): McFile[] {

    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'name':
          return compare(a.name, b.name, isAsc);
        case 'size':
          return compare( (a.size!==undefined) ? +a.size : 0, (b.size!==undefined) ? +b.size : 0, isAsc);
        default:
          return 0;
      }
    });
  }

  refresh(f: McFile[]) {
    this.dirListSubject.next(this.getSortedData(f));
  }

  getCurrentData():McFile[] {
    return this.dirListSubject.value;
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
