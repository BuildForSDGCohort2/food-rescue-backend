import { Injectable, Inject } from '@nestjs/common';
import { CreateBlogDto, BlogCommentDto } from './dto/create-blog.dto';
import { Model } from 'mongoose';
import { IBlog, IBlogComment } from './interfaces/blog.interface';

@Injectable()
export class BlogService {
  constructor(@Inject('BLOG_MODEL') private readonly BlogModel: Model<IBlog>) {}
  async createBlog(blog: CreateBlogDto, userId: string) {
    const theBlog = {
      authorUserId: userId,
      title: blog.title,
      category: blog.category,
      body: blog.body,
      pic: blog.pic,
      timestamp: new Date(),
    };
    const createdBlog = await new this.BlogModel(theBlog);
    return createdBlog.save();
  }

  async getAllBlog() {
    return await this.BlogModel.find().exec();
  }

  async getBlogDetail(blogId) {
    return await this.BlogModel.findById(blogId).exec();
  }
  async editBlog(blog, blogId) {
    return await this.BlogModel.update({ _id: blogId }, blog).exec();
  }

  async deleteBlog(blogId) {
    return await this.BlogModel.remove({ _id: blogId }).exec();
  }

  async approveOrDisapproveBlog(
    value: boolean,
    blogId: string,
    userId: string,
  ) {
    return await this.BlogModel.updateOne(
      { _id: blogId },
      { approved: value, approvedBy: userId },
    ).exec();
  }

  async commentOnBlog(
    comment: { comment: string },
    blogId: string,
    commenterUserId: string,
  ) {
    const theComment: BlogCommentDto = {
      comment: comment.comment,
      time: new Date(),
      commenterUserId: commenterUserId,
    };
    return await this.BlogModel.updateOne(
      { _id: blogId },
      { $addToSet: { comments: theComment } },
    );
  }

  async getComments(blogId) {
    const blog = await this.BlogModel.find({ _id: blogId }).exec();
    if (blog) {
      return blog[0].comments;
    }
  }

  async editComment(
    blogId: string,
    commentId: string,
    newComment: string,
    editorUserId: string,
  ) {
    const blogComment = await this.BlogModel.findById(
      blogId,
      async (err, res) => {
        return await res.comments.filter(value => {
          value.commenterUserId === editorUserId && value._id === commentId;
        });
      },
    )
      .exec()
      .then(value => {
        return value.comments[0];
      });
    console.log(`blog returned value is: ${blogComment}`);

    if (blogComment) {
      const newCommentObject = {
        hide: false,
        edited: true,
        _id: commentId,
        comment: newComment,
        time: blogComment.time,
        commenterUserId: blogComment.commenterUserId,
      };
      return await this.BlogModel.updateOne(
        { _id: blogId, 'comments._id': commentId },
        { $set: { 'comments.$': newCommentObject } },
      );
    } else {
      throw new Error(
        'You are not authorized to edit a comment that is not yours',
      );
    }
  }

  async editOthersComment(
    blogId: string,
    newComment: string,
    commentId: string,
  ) {
    return await this.BlogModel.update(
      { _id: blogId, 'comments._id': commentId },
      { $set: { comment: newComment } },
    );
  }

  async deleteComment(blogId: string, commentId) {
    return await this.BlogModel.updateOne(
      { _id: blogId },
      { $pull: { comments: { _id: commentId } } },
    );
  }

  async hideOrShowComment(value: boolean, blogId: string, commentId: string) {
    return await this.BlogModel.updateOne(
      { _id: blogId, comments: { _id: commentId } },
      { $set: { hide: value } },
    );
  }
}
