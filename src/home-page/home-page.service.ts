import { Injectable } from '@nestjs/common';
import { CreateHomePageDto, EditHomePageDto } from './dto/create-home-page.dto';
import { Model } from 'mongoose';
import { IHomePage } from './interfaces/home-page.interface';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class HomePageService {
  constructor(
    @InjectModel('HomePage') private readonly HomePageModel: Model<IHomePage>,
  ) {}
  async createHomePageData(homePage: CreateHomePageDto) {
    //Ensure that there is only one instance of the document in the database.
    const numberOfDocuments = await this.HomePageModel.estimatedDocumentCount();
    if (numberOfDocuments < 1) {
      const createdHomePage = await new this.HomePageModel(homePage);
      return createdHomePage.save();
    }
    if (numberOfDocuments >= 1) {
      throw new Error(
        'An instance of this document already exists. You cannot have more than one.',
      );
    }
  }

  async getHomePageData() {
    const result = await this.HomePageModel.find().exec();
    return result[0];
  }

  async updateHomePageData(edit: EditHomePageDto) {
    return await this.HomePageModel.updateOne({}, edit).exec();
  }
}
