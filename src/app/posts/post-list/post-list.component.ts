import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { IPost } from '../post.model';
import { PostsService } from '../posts.service';
import { PageEvent } from '@angular/material';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  // posts = [
  //   { title: "First IPost", content: "This is the first post's content" },
  //   { title: "Second IPost", content: "This is the second post's content" },
  //   { title: "Third IPost", content: "This is the third post's content" }
  // ];
  private postsSub: Subscription;
  private authListenerSub: Subscription;

  posts: IPost[] = [];
  isLoading = false;

  totalPosts = 0;
  postsPerPage = 2;
  pageSizeOptions = [1, 2, 5, 10];

  currentPage = 1;

  userIsAuthenticated = false;

  userId: string;

  constructor(public postsService: PostsService, private authService: AuthService) {}

  ngOnInit() {
    this.isLoading = true;

    this.userId = this.authService.getUserId();

    this.postsService.getPosts(this.postsPerPage, this.currentPage);

    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((postsData: {posts: IPost[], postCount: number}) => {
        this.isLoading = false;
        this.totalPosts = postsData.postCount;
        this.posts = postsData.posts;
      });

    this.userIsAuthenticated = this.authService.getIsAuthenticated();

    this.authListenerSub = this.authService.getAuthStatusListener()
      .subscribe(
        (isAuthenticated) => {
          this.userIsAuthenticated = isAuthenticated;
          this.userId = this.authService.getUserId();
        }
      );
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }

  onDeletePost(id: string) {
    this.postsService.deletePost(id)
      .subscribe(
        () => this.postsService.getPosts(this.postsPerPage, this.currentPage)
      );
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }
}
