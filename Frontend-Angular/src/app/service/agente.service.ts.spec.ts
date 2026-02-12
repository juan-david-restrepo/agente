import { TestBed } from '@angular/core/testing';

import { AgenteServiceTs } from './agente.service.ts';

describe('AgenteServiceTs', () => {
  let service: AgenteServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgenteServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
