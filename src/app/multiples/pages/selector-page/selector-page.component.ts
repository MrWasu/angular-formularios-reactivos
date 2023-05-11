import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Region, SmallCountry, Country } from '../../interfaces/country.interfaces';
import { CountriesService } from '../../services/countries.service';
import { filter, switchMap, tap } from 'rxjs';

@Component({ 
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html'
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];


  public myForm: FormGroup = this.fb.group({
    region : ['', Validators.required ],
    country: ['', Validators.required ],
    border : ['', Validators.required ],
  });

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) {}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }


onRegionChanged(): void {
  // Obtener los cambios de valor del campo "region" en el formulario
  this.myForm.get('region')!.valueChanges
    .pipe(
      // Establecer el valor de "country" en blanco cuando se cambia la región
      tap( () => this.myForm.get('country')!.setValue('') ),
      // Reiniciar la lista de fronteras cuando se cambia la región
      tap( () => this.borders = [] ),
      // Obtener los países para la región seleccionada
      switchMap( (region) => this.countriesService.getCountriesByRegion(region) ),
    )
    // Actualizar la lista de países por región en la vista
    .subscribe( countries => {
      this.countriesByRegion = countries;
    })
}

onCountryChanged(): void { 
  // Obtener los cambios de valor del campo "country" en el formulario
  this.myForm.get('country')!.valueChanges
    .pipe(
      // Establecer el las fronteras en blanco cuando se cambia el país
      tap( () => this.myForm.get('border')!.setValue('') ),
      // Filtrar los valores que tengan una longitud mayor que 0
      filter( (value: string) => value.length > 0 ),
      // Obtener el país seleccionado
      switchMap( (alphaCode) => this.countriesService.getCountryByAlphaCode(alphaCode) ),
      // Obtener las fronteras del país seleccionado
      switchMap( (country) => this.countriesService.getCountryBordersByCodes( country.borders ) ),
    )
    // Actualizar la lista de fronteras en la vista
    .subscribe( countries => {
      this.borders = countries;
      console.log(this.borders)
    });
}


}
