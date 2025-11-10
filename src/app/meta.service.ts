import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MetaService {

  constructor(private title: Title, private meta: Meta) { }

  updateTags(title: string, description: string, url: string, type: string = 'website') {
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: `https://didimissmytrain.com${url}` });
    this.meta.updateTag({ property: 'og:type', content: type });
  }
}
