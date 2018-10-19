import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { IPost } from './post.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: IPost[] = [];
  private postsUpdated = new Subject<IPost[]>();
  private apiUrl = 'http://localhost:3000/api/posts';

  constructor(private http: HttpClient) {}

  getPosts() {
    this.http.get<{message: string, posts: any[]}>(this.apiUrl)
      .pipe(
        map( (postData) => {
          return postData.posts.map((post) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id
            };
          });
        })
      )
      .subscribe(
        (transformedPosts) => {
          this.posts = transformedPosts;
          this.postsUpdated.next([...this.posts]);
        }
      );
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: IPost = {title: title, content: content};
    this.http.post<{message: string, postId: string}>(this.apiUrl, post)
      .subscribe(
        (responseData) => {
          post.id = responseData.postId;
          this.posts.push(post);
          this.postsUpdated.next([...this.posts]);
        }
      );
  }

  deletePost(postId: string) {
    this.http.delete(`${this.apiUrl}/${postId}`)
      .subscribe(() => {
        console.log('Deleted =P');
        this.posts = this.posts.filter((post) => post.id !== postId);
        this.postsUpdated.next([...this.posts]);
      });
  }
}
