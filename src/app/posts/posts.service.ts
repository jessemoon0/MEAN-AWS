import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { IPost } from './post.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: IPost[] = [];
  private postsUpdated = new Subject<{posts: IPost[], postCount: number}>();
  private apiUrl = `${environment.apiURL}/posts`;

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    // const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{message: string, posts: any[], maxPosts: number}>(this.apiUrl, {
      params: new HttpParams().set('pageSize', postsPerPage.toString())
        .append('page', currentPage.toString())
    })
      .pipe(
        map( (postData) => {
          return {
            posts: postData.posts.map((post) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator
              };
            }),
            maxPosts: postData.maxPosts
          };
        })
      )
      .subscribe(
        (transformedPostsData) => {
          this.posts = transformedPostsData.posts;
          this.postsUpdated.next({posts: [...this.posts], postCount: transformedPostsData.maxPosts});
        }
      );
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{_id: string, title: string, content: string, imagePath: string, creator: string}>(
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
      postData = { id, title, content, imagePath: image, creator: null };
    }

    this.http.put<IPost>(`${this.apiUrl}/${id}`, postData)
      .subscribe((response) => {
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    return this.http.delete(`${this.apiUrl}/${postId}`);
  }
}
