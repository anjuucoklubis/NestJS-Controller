import { Body, Controller, Get, Param, Post, Query, Render, Req, Res, UseGuards } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { Response } from "express";
import { AuthenticatedGuard } from "src/auth/user/common/guards/authenticated.guard";
import { generatePaginationLink, queryPage } from "src/utils/pagination-type";
import { DaerahService } from "../daerah.service";

@Controller('admin/daerah')
export class AdminDaerahController {
  constructor(
    private daerahService: DaerahService
  ) { } DestinasiCreateInput

  @UseGuards(AuthenticatedGuard)
  @Get('list')
  @Render('admin/daerah/list')
  async listDaerah(
    @Query('page') paginatePage: string,
    @Query('size') paginateSize: string,
    @Res() res: Response,
    @Req() req: any
  ) {
    if(req.user.role !== 'ADMIN') res.redirect('/login')
    if (!paginatePage || !paginatePage) {
      return res.redirect(`/admin/daerah/list${queryPage(1, 10)}`)
    }
    const list = await this.daerahService.findAllDaerah({
      page: +paginatePage || 1,
      size: +paginateSize || 10
    })
    const total = await this.daerahService.count()
    const results = {
      user: req.user,
      list: list,
      paginations: generatePaginationLink(total, +paginatePage, +paginateSize, '/admin/daerah/list')
    }
    return results
  }

  // Halaman tambah daerah
  @UseGuards(AuthenticatedGuard)
  @Get('add')
  @Render('admin/daerah/add')
  async formAddDaerah(
    @Req() req: any,
    @Res() res: Response,
  ) {
    if(req.user.role !== 'ADMIN') res.redirect('/login')
    return {
      user: req.user
    }
  }

  // Action Form tambah daerah
  @Post('add/save')
  async actionAddSaveDaerah(
    @Res() res: Response,
    @Body() body: Prisma.DaerahCreateInput
  ) {
    await this.daerahService.create(body)
    res.redirect('/admin/daerah/list')
  }

  // Halaman edit daerah
  @UseGuards(AuthenticatedGuard)
  @Get('edit/:id')
  @Render('admin/daerah/edit')
  async editDaerah(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    if(req.user.role !== 'ADMIN') res.redirect('/login')
    return {
      user: req.user,
      detail: await this.daerahService.findOne({ id: +id })
    }
  }

  // Action Save daerah
  @Post('edit/save/:id')
  async actionEditSaveDaerah(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() body: Prisma.DaerahUpdateInput
  ) {
    await this.daerahService.update(+id, body)
    res.redirect('/admin/daerah/list')
  }

  @Get('delete/:id')
  async deleteDaerah(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.daerahService.delete(+id)
    res.redirect('/admin/daerah/list')
  }
}