import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { invoke } from "@tauri-apps/api/core";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  txt = "";
  err = "";

  run_query(event: SubmitEvent, data: string): void {
    event.preventDefault();

    invoke<string>("run_query", { query: data })
    .then((text) => {
      this.txt = text;
      this.err = "";
    })
    .catch((error) => {
      this.txt = "";
      this.err = error;
    })
    ;
  }
}
