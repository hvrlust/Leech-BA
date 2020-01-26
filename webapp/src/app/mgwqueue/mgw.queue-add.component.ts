import {AfterViewInit, Component, DoCheck, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {MgwQueueService} from './mgw.queue.service';
import {faArrowDown} from '@fortawesome/free-solid-svg-icons';
import {faPlusCircle, faMinusCircle} from '@fortawesome/free-solid-svg-icons';
import {library} from '@fortawesome/fontawesome-svg-core';

library.add(faArrowDown, faPlusCircle, faMinusCircle);

export interface RequestPoints {
  attack?: number;
  collector?: number;
  defender?: number;
  healer?: number;
}

export interface RequestBxp {
  agility?: number;
  mining?: number;
  firemaking?: number;
}
export interface Services {
  bxp?: RequestBxp;
  points?: RequestPoints;
  king?: number;
  queen?: number;
}
export interface Request {
  date: Date;
  rsn?: string;
  ba?: string;
  notes?: string;
  discord?: string;
  services?: Services;
}

@Component({
  selector: 'mgw-app-queue',
  templateUrl: './mgw.queue-add.component.html',
  styleUrls: ['./mgw.queue-add.component.scss'],
})
export class MgwQueueAddComponent implements AfterViewInit, DoCheck {
  isValid = false;
  selected = {
    bxp: false,
    points: false,
    king: false,
    queen: false
  };
  selectedBxp = {
    agility: false,
    mining: false,
    firemaking: false
  };
  selectedPoints = {
    attack: false,
    collector: false,
    defender: false,
    healer: false,
    all : false
  };
  request: Request = {
    date: new Date(),
    services : {
      bxp: {},
      points: {},
      king: 1,
      queen: 1
    }
  };
  @ViewChild('content') container: ElementRef;
  scrollable = false;
  constructor(
    public dialogRef: MatDialogRef<MgwQueueAddComponent>, private queueService: MgwQueueService, private renderer: Renderer2)  {
  }
  ngDoCheck() {
    this.checkForScrollBar();
  }
  ngAfterViewInit() {
    this.renderer.listen(this.container.nativeElement, 'scroll', () => {
      this.checkForScrollBar();
    });
  }
  onCloseClick(): void {
    this.dialogRef.close();
  }
  changeKing(increment: number): void {
    this.request.services.king = Math.max(0, this.request.services.king + increment);
    this.validate();
  }
  changeQueen(increment: number): void {
    this.request.services.queen = Math.max(0, this.request.services.queen + increment);
    this.validate();
  }
  selectAll({checked}): void {
    this.selectedPoints.attack = checked;
    this.selectedPoints.defender = checked;
    this.selectedPoints.healer = checked;
    this.selectedPoints.collector = checked;
  }
  checkAll(): void {
    this.selectedPoints.all = (
      this.selectedPoints.attack &&
      this.selectedPoints.collector &&
      this.selectedPoints.healer &&
      this.selectedPoints.defender
    );
  }
  checkForScrollBar(): void {
    const container = this.container.nativeElement;
    const pos = container.scrollTop + container.offsetHeight;
    const max = container.scrollHeight;
    this.scrollable = false;
    // pos/max will give you the distance between scroll bottom and and bottom of screen in percentage.
    if (pos !== max && container.scrollHeight !== container.clientHeight)   {
      this.scrollable = true;
    }
  }
  validate(): void {
    this.isValid = true;
    if (this.request.rsn === undefined || this.request.rsn === '') {
      this.isValid = false;
      return;
    }
    if (this.request.ba === undefined || this.request.ba === '') {
      this.isValid = false;
      return;
    }
    // invalid if nothing selected
    if (!this.selected.points && !this.selected.king && !this.selected.bxp && !this.selected.queen) {
      this.isValid = false;
      return;
    }
    if (this.selected.points) {
      if (!this.selectedPoints.attack && !this.selectedPoints.collector && !this.selectedPoints.defender && !this.selectedPoints.healer) {
        this.isValid = false;
        return;
      }
      if (this.selectedPoints.attack) {
        if (this.request.services.points.attack === undefined || Number(this.request.services.points.attack) <= 0) {
          this.isValid = false;
          return;
        }
      }
      if (this.selectedPoints.collector) {
        if (this.request.services.points.collector === undefined || Number(this.request.services.points.collector) <= 0) {
          this.isValid = false;
          return;
        }
      }
      if (this.selectedPoints.healer) {
        if (this.request.services.points.healer === undefined || Number(this.request.services.points.healer) <= 0) {
          this.isValid = false;
          return;
        }
      }
      if (this.selectedPoints.defender) {
        if (this.request.services.points.defender === undefined || Number(this.request.services.points.defender) <= 0) {
          this.isValid = false;
          return;
        }
      }
    }
    if (this.selected.bxp) {
      if (!this.selectedBxp.agility && !this.selectedBxp.mining  && !this.selectedBxp.firemaking) {
        this.isValid = false;
        return;
      }
      if (this.selectedBxp.agility) {
        if (this.request.services.bxp.agility === undefined || Number(this.request.services.bxp.agility) <= 0) {
          this.isValid = false;
          return;
        }
      }
      if (this.selectedBxp.mining) {
        if (this.request.services.bxp.mining === undefined || Number(this.request.services.bxp.mining) <= 0) {
          this.isValid = false;
          return;
        }
      }
      if (this.selectedBxp.firemaking) {
        if (this.request.services.bxp.firemaking === undefined || Number(this.request.services.bxp.firemaking) <= 0) {
          this.isValid = false;
          return;
        }
      }
    }
    if (this.selected.king && this.request.services.king <= 0) {
      this.isValid = false;
      return;
    }
    if (this.selected.queen && this.request.services.queen <= 0) {
      this.isValid = false;
      return;
    }
  }
  onSubmitClick(): boolean {
    this.validate();
    if (!this.isValid) {
      return;
    }

    let request: Request;
    request = {
      date: this.request.date,
      rsn: this.request.rsn,
      ba: this.request.ba,
      notes: '',
      discord: '',
      services: {}
    };
    if (this.selected.points) {
      if (this.selectedPoints.attack) {
        if (request.services.points === undefined) {
          request.services.points = {};
        }
        request.services.points.attack = this.request.services.points.attack;
      }
      if (this.selectedPoints.collector) {
        if (request.services.points === undefined) {
          request.services.points = {};
        }
        request.services.points.collector = this.request.services.points.collector;
      }
      if (this.selectedPoints.healer) {
        if (request.services.points === undefined) {
          request.services.points = {};
        }
        request.services.points.healer = this.request.services.points.healer;
      }
      if (this.selectedPoints.defender) {
        if (request.services.points === undefined) {
          request.services.points = {};
        }
        request.services.points.defender = this.request.services.points.defender;
      }
    }

    if (this.selected.bxp) {
      if (this.selectedBxp.agility) {
        if (request.services.bxp === undefined) {
          request.services.bxp = {};
        }
        request.services.bxp.agility = this.request.services.bxp.agility;
      }
      if (this.selectedBxp.mining) {
        if (request.services.bxp === undefined) {
          request.services.bxp = {};
        }
        request.services.bxp.mining = this.request.services.bxp.mining;
      }
      if (this.selectedBxp.firemaking) {
        if (request.services.bxp === undefined) {
          request.services.bxp = {};
        }
        request.services.bxp.firemaking = this.request.services.bxp.firemaking;
      }
    }

    if (this.selected.king) {
      if (this.request.services.king > 0) {
        request.services.king = this.request.services.king;
      }
    }

    if (this.selected.queen) {
      if (this.request.services.queen > 0) {
        request.services.queen = this.request.services.queen;
      }
    }

    if (this.request.notes) {
      request.notes = this.request.notes;
    }
    if (this.request.discord) {
      request.discord = this.request.discord;
    }
    this.queueService.addCustomer(request).subscribe(res => {
      this.dialogRef.close('refresh');
      return true;
    }, error => {
      // TODO something
      console.log(error);
    });
    return false;
  }
}
