import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-legacy-calculator',
  templateUrl: './legacy-calculator.component.html',
  styleUrls: ['./calculator-3.3.2.css'],
  encapsulation: ViewEncapsulation.None
})

export class LegacyCalculatorComponent {
  constructor() {
    this.loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js', false, false);

    this.loadScript('assets/calculator-4.0.1.js', false, false);
  }

  public loadScript(url, async, defer) {
    const body = <HTMLDivElement> document.body;
    const script = document.createElement('script');
    script.innerHTML = '';
    script.src = url;
    script.async = async;
    script.defer = defer;
    body.appendChild(script);
  }
}
