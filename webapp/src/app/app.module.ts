import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { CalculatorModule } from './calculator/calculator.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NavModule } from './nav/nav.module';
import { QueueModule } from './queue/queue.module';
import { MgwQueueModule } from './mgwqueue/mgw.queue.module';
import { MAT_DATE_LOCALE } from '@angular/material';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SplitsModule } from './splits/splits.module';
import { LegacyCalculatorComponent } from './legacy-calculator/legacy-calculator.component';
import { InformationComponent } from './information/information.component';
import { LeechingGuideComponent } from './leeching-guide/leeching-guide.component';
import { RankListModule } from "./rank-list/rank-list.module";
import { CalcModule } from './calc/calc.module';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LegacyCalculatorComponent,
    InformationComponent,
    LeechingGuideComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CalculatorModule,
    CalcModule,
    QueueModule,
    MgwQueueModule,
    SplitsModule,
    NavModule,
    RankListModule,
    FontAwesomeModule,
    MaterialModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

