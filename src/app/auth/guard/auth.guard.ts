import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Route,
  RouterStateSnapshot,
  UrlSegment,
  CanMatchFn,
  CanActivateFn,
  Router,
} from '@angular/router';
import { Observable, tap } from 'rxjs';

import { AuthService } from '../services/auth.service';

const checkAuthStatus = (): boolean | Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkAuthStatus().pipe(
    tap((isAuth) => {
      if (!isAuth) router.navigate(['./auth/login']);
    })
  );
};

export const authCanMatch: CanMatchFn = (
  route: Route,
  urlSegments: UrlSegment[]
) => {
  return checkAuthStatus();
};

export const authCanActivate: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return checkAuthStatus();
};
