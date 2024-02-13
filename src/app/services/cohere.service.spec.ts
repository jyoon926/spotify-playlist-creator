import { TestBed } from '@angular/core/testing';

import { CohereService } from './cohere.service';

describe('CohereService', () => {
  let service: CohereService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CohereService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
