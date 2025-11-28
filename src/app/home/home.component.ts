import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  standalone: true,
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToQuery(view: string) {
    this.router.navigate(['/dbquery'], { queryParams: { view } });
  }
}
