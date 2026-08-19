import { Component } from '@angular/core';
import {ButtonComponent} from '../../../../shared/ui/button/button';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [ ButtonComponent, RouterLink ],
  templateUrl: './not-found.html'
})
export class NotFound {

}
