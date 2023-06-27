import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';
import { filter, switchMap, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [],
})
export class NewPageComponent implements OnInit {
  public heroForm = new FormGroup({
    id: new FormControl(''),
    superhero: new FormControl('', { nonNullable: true }),
    publisher: new FormControl<Publisher>(Publisher.DCComics),
    alter_ego: new FormControl(''),
    first_appearance: new FormControl(''),
    characters: new FormControl(''),
    alt_img: new FormControl(''),
  });

  public publishers = [
    { id: 'DC Comics', desc: 'DC - Comics' },
    { id: 'Marvel Comics', desc: 'Marvel' },
  ];

  constructor(
    private heroesServices: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (!this.router.url.includes('edit')) return;

    this.activatedRoute.params
      .pipe(switchMap(({ id }) => this.heroesServices.getHeroById(id)))
      .subscribe((hero) => {
        if (!hero) return this.router.navigateByUrl('/');
        this.heroForm.reset(hero);
        return;
      });
  }

  get currentHero(): Hero {
    return this.heroForm.value as Hero;
  }

  public onSubmit(): void {
    if (this.heroForm.invalid) return;
    if (this.currentHero.id) {
      this.heroesServices.updateHero(this.currentHero).subscribe((hero) => {
        this.showSnackBar(`${hero.superhero} updated!`);
      });
      return;
    }

    this.heroesServices.addHero(this.currentHero).subscribe((hero) => {
      this.showSnackBar(`${hero.superhero} created!`);
      this.router.navigate(['/heroes/edit', hero.id]);
    });
  }

  onDeleteHero() {
    if (!this.currentHero) throw new Error('hero id is required');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: this.currentHero,
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((result: boolean) => result === true),
        switchMap(() =>
          this.heroesServices.deleteHeroById(this.currentHero.id)
        ),
        filter((isDeleted: boolean) => isDeleted === true)
      )
      .subscribe(() => {
        this.router.navigate(['/heroes/list']);
      });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (!result) return;
    //   this.heroesServices
    //     .deleteHeroById(this.currentHero.id)
    //     .subscribe((isDeleted) => {
    //       if (isDeleted) this.router.navigate(['/heroes/list']);
    //     });
    // });
  }

  showSnackBar(message: string): void {
    this.snackbar.open(message, 'done', { duration: 2500 });
  }
}
