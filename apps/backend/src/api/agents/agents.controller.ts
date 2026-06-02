import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dtos/create-agent.dto';
import { UpdateAgentDto } from './dtos/update-agent.dto';
import { CreateKnowledgeDto } from './dtos/create-knowledge.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Agents')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  getAgents() {
    return this.agentsService.findAll();
  }

  @Get(':id')
  getAgentById(@Param('id') id: string) {
    return this.agentsService.findOne(id);
  }

  @Post()
  createAgent(@Body() createAgentDto: CreateAgentDto) {
    return this.agentsService.create(createAgentDto);
  }

  @Put(':id')
  updateAgent(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto) {
    return this.agentsService.update(id, updateAgentDto);
  }

  @Delete(':id')
  deleteAgent(@Param('id') id: string) {
    return this.agentsService.remove(id);
  }

  @Get(':id/knowledge')
  getKnowledge(@Param('id') id: string) {
    return this.agentsService.findKnowledge(id);
  }

  @Post(':id/knowledge')
  addKnowledge(@Param('id') id: string, @Body() createKnowledgeDto: CreateKnowledgeDto) {
    return this.agentsService.addKnowledge(id, createKnowledgeDto);
  }

  @Delete(':id/knowledge/:knowledgeId')
  deleteKnowledge(@Param('id') id: string, @Param('knowledgeId') knowledgeId: string) {
    return this.agentsService.removeKnowledge(id, knowledgeId);
  }

  @Get(':id/chats')
  getChats(@Param('id') id: string) {
    return this.agentsService.findChats(id);
  }

  @Post(':id/chats')
  createChat(@Param('id') id: string) {
    return this.agentsService.createChat(id);
  }
}
