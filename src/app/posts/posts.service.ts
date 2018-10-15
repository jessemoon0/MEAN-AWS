import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { IPost } from './post.model';
import { HttpClient } from '@angular/common/http';
import { s, st } from '@angular/core/src/render3';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: IPost[] = [];
  private postsUpdated = new Subject<IPost[]>();
  private apiUrl = 'http://localhost:3000/api/posts';

  constructor(private http: HttpClient) {}

  getPosts() {
    this.http.get<{message: string, posts: IPost[]}>(this.apiUrl)
      .subscribe(
        (postData) => {
          this.posts = postData.posts;
          this.postsUpdated.next([...this.posts]);
        }
      );
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: IPost = {title: title, content: content};
    this.http.post<{message: string}>(this.apiUrl, post)
      .subscribe(
        (responseData) => {
          console.log(responseData.message);
          this.posts.push(post);
          this.postsUpdated.next([...this.posts]);
        }
      );
  }
}
