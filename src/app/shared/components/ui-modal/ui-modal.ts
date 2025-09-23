import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';

@Component({
  selector: 'app-ui-modal',
  standalone: true,
  imports: [],
  templateUrl: './ui-modal.html',
  styleUrl: './ui-modal.css'
})
export class UiModal implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() lockScroll = true;
  @Output() openChange = new EventEmitter<boolean>();

  ngOnChanges() { this.syncScrollLock(); }

  private syncScrollLock() {
    if (!this.lockScroll) return;
    const cls = 'modal-open';
    if (this.open) document.body.classList.add(cls);
    else document.body.classList.remove(cls);
  }

  close() {
    this.open = false;
    this.openChange.emit(false);
    this.syncScrollLock();
  }

  ngOnDestroy() {
    document.body.classList.remove('modal-open');
  }
}
