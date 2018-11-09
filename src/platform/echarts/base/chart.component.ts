import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  DoCheck,
} from '@angular/core';
import { Subscription, Subject, fromEvent, merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { connect, init, ECharts, EChartOption } from 'echarts';

import { TdChartOptionsService, CHART_PROVIDER } from './chart-options.service';
import { assignDefined } from './utils';

@Component({
  selector: 'td-chart',
  template: '',
  styleUrls: ['./chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CHART_PROVIDER],
})
export class TdChartComponent implements AfterViewInit, OnChanges, DoCheck, OnDestroy {
  private readonly defaultOptions: EChartOption = {
    grid: {
      show: true,
      left: '20',
      right: '20',
      bottom: '10',
      top: '10',
      containLabel: true,
      borderColor: '#FCFCFC',
    },
    xAxis: [{}],
    yAxis: [{}],
    series: [],
  };
  private _subs: Subscription[] = [];
  private _widthSubject: Subject<number> = new Subject<number>();
  private _heightSubject: Subject<number> = new Subject<number>();

  private _state: EChartOption = {};
  private _options: any = {};

  private _instance: ECharts;
  get instance(): ECharts {
    return this._instance;
  }

  @Input('config') config: any = {};

  @Input('group') group: string;

  @Output('click') click: EventEmitter<any> = new EventEmitter<any>();
  @Output('dblclick') dblclick: EventEmitter<any> = new EventEmitter<any>();
  @Output('contextmenu') contextmenu: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _changeDetectorRef: ChangeDetectorRef,
              private _elementRef: ElementRef,
              private _optionsService: TdChartOptionsService) {
  }

  ngAfterViewInit(): void {
    this._instance = init(this._elementRef.nativeElement);
    this._subs.push(
      fromEvent(this._instance, 'click').subscribe((params: any) => {
        this.click.next(params);
      }),
    );
    this._subs.push(
      fromEvent(this._instance, 'dblclick').subscribe((params: any) => {
        this.dblclick.next(params);
      }),
    );
    this._subs.push(
      fromEvent(this._instance, 'contextmenu').subscribe((params: any) => {
        this.contextmenu.next(params);
      }),
    );
    if (this.group) {
      this._instance.group = this.group;
      connect(this.group);
      this._changeDetectorRef.markForCheck();
    }
    this._subs.push(
      merge(
        fromEvent(window, 'resize').pipe(
          debounceTime(100),
        ),
        this._widthSubject.asObservable().pipe(
          debounceTime(100),
        ),
        this._heightSubject.asObservable().pipe(
          debounceTime(100),
        ),
      ).pipe(
        debounceTime(100),
      ).subscribe(() => {
        this._instance.resize();
        this._changeDetectorRef.markForCheck();
      }),
    );
    this.render();
    this._optionsService.listen().subscribe((options: any) => {
      assignDefined(this._options, options);
      this.render();
    });
  }

  ngDoCheck(): void {
    if (this._elementRef && this._elementRef.nativeElement) {
      this._widthSubject.next((<HTMLElement>this._elementRef.nativeElement).getBoundingClientRect().width);
      this._heightSubject.next((<HTMLElement>this._elementRef.nativeElement).getBoundingClientRect().height);
    }
  }

  ngOnChanges(): void {
    if (this._instance) {
      this._instance.clear();
      this.render();
    }
  }

  ngOnDestroy(): void {
    if (this._subs) {
      this._subs.forEach((sub: Subscription) => {
        sub.unsubscribe();
      });
    }
  }

  render(): void {
    if (this._instance) {
      const mergedOptions: EChartOption = assignDefined(this._state, this.defaultOptions, this.config || {}, this._options);
      this._instance.setOption(mergedOptions, true);
      this._changeDetectorRef.markForCheck();
    }
  }

}
