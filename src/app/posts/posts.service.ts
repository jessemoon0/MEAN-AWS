import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { IPost } from './post.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: IPost[] = [];
  private postsUpdated = new Subject<IPost[]>();
  private apiUrl = 'http://localhost:3000/api/posts';

  constructor(private http: HttpClient, private router: Router) {}

  getPosts() {
    this.http.get<{message: string, posts: any[]}>(this.apiUrl)
      .pipe(
        map( (postData) => {
          return postData.posts.map((post) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath
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

  getPost(id: string) {
    return this.http.get<{_id: string, title: string, content: string, imagePath: string}>(
      `${this.apiUrl}/${id}`
    );
  }

  addPost(title: string, content: string, image: File) {
    // const post: IPost = {title: title, content: content};
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.http.post<{message: string, post: IPost}>(this.apiUrl, postData)
      .subscribe(
        (responseData) => {

          const post: IPost = {
            id: responseData.post.id,
            title,
            content,
            imagePath: responseData.post.imagePath
          };

          // post.id = responseData.postId;
          this.posts.push(post);
          this.postsUpdated.next([...this.posts]);
          this.router.navigate(['/']);
        }
      );
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    // Check if image is file or string
    let postData: IPost | FormData;

    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = { id, title, content, imagePath: image };
    }

    this.http.put<IPost>(`${this.apiUrl}/${id}`, postData)
      .subscribe((response) => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex((p) => p.id === id);
        const post: IPost = { id, title, content, imagePath: response.imagePath };
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });
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
